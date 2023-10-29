let isi_surat, nomor_surat, DEBUG_MODE, hasil_cari = [];
const cari_ayat = document.querySelector('nav form input.form-control');
DEBUG_MODE = true;

function waitFor(conditionFunction) {
    const poll = resolve => {
      if(conditionFunction()) resolve();
      else setTimeout(_ => poll(resolve), 400);
    }
    return new Promise(poll);
}; // source: https://stackoverflow.com/a/52652681

function debuglog(msg) {
    if (DEBUG_MODE) {
        console.log(msg);
    };
};

function loading(message) {
    document.querySelector('body>.container').innerHTML = `
<div class="loading-container">
    <div class="loading-circle"></div>
    <p>${message}</p>
</div>`;
};

function get_param(param) {
    const url_variable = window.location.search.substring(1).split('&');
    for (let x = 0; x < url_variable.length; x++) {
        const param_name = url_variable[x].split('=');
        if (param_name[0] == param) {
            debuglog('param \'' + param + '\' is \'' + param_name[1] + '\'');
            nomor_surat = param_name[1];
            return param_name[1]
        };
    };
};

function get_isi_surat(nomor_surat) {
    fetch('https://equran.id/api/surat/' + nomor_surat).then(response => response.json()).then(response => {
        isi_surat = response;
        debuglog(isi_surat);
        if (isi_surat == null) {
            loading(`Invalid surat number (there is no surat number ${nomor_surat})`);
            history.back()
        };
    }).catch(error => loading(`${error}, check your connection and refresh`));
};

function display_cari_ayat() {
    debuglog('display_cari_surat() is called');
    if (cari_ayat.value == '') {
        debuglog('query is empty, using display_isi_surat instead');
        display_isi_surat();
    } else {
        let card_ayat = '';
        hasil_cari = [];
        const query = cari_ayat.value.toLowerCase();
        debuglog('query is ' + query);
        isi_surat.ayat.forEach(ayat => {
            if (ayat.ar.toLowerCase().includes(query) || ayat.tr.toLowerCase().includes(query) || ayat.idn.toLowerCase().includes(query) || ayat.nomor === parseInt(query)) {
                function highlight_search(text, search) {
                    const regex = new RegExp(search, 'gi');
                    return text.replace(regex, (match) => `<span class="highlighted">${match}</span>`);
                };
                card_ayat += `
<div class="card mb-3 card-ayat" id="ayat-${ayat.nomor}">
    <div class="card-body">
        <p class="nomor">${highlight_search(String(ayat.nomor), query)}</p>
        <p class="text-end arab">${highlight_search(ayat.ar, query)}</p>
        <p class="latin">${highlight_search(ayat.tr, query)}</p>
        <p class="arti">${highlight_search(ayat.idn, query)}</p>
    </div>
</div>`;
                hasil_cari.push(`ayat-${ayat.nomor}`);
            } else {
                card_ayat += `
<div class="card mb-3 card-ayat card-ayat-inactive" id="ayat-${ayat.nomor}">
    <div class="card-body">
        <p class="nomor">${ayat.nomor}</p>
        <p class="text-end arab">${ayat.ar}</p>
        <p class="latin">${ayat.tr}</p>
        <p class="arti">${ayat.idn}</p>
    </div>
</div>`;
            };
        });
        document.querySelector('body>.container .row .col .ayat').innerHTML = card_ayat;
        if (hasil_cari.length >= 1) {document.getElementById(hasil_cari[0]).scrollIntoView();};
    };
};

function display_isi_surat() {
    const ayat_surat = isi_surat.ayat;
    let card_surat_title = `
<div class="card mb-3 card-surat-title">
    <div class="card-body">
        <strong><span><span class="nomor">${isi_surat.nomor}</span>. <span class="nama-latin">${isi_surat.nama_latin}</span></span><span class="text-end nama arab">${isi_surat.nama}</span></strong>
        <p class="info"><span class="tempat-turun">${JSON.parse('{"mekah":"Makkiyyah","madinah":"Madaniyyah"}')[isi_surat.tempat_turun]}</span><span class="dot">•</span><span><span class="jumlah-ayat">${isi_surat.jumlah_ayat}</span> ayat</span><span class="dot">•</span><span class="text-end arti-nama">${isi_surat.arti}</span></p>
        <p class="deskripsi">${isi_surat.deskripsi}</p>
        <div class="audio"><button class="btn bg-body-tertiary" onclick="play_surat_audio();"><span class="bi bi-play-fill"></span> Putar audio</button></div>
    </div>
</div>`, card_ayat = '';
    ayat_surat.forEach(ayat => {
        card_ayat += `
<div class="card mb-3 card-ayat" id="ayat-${ayat.nomor}">
    <div class="card-body">
        <p class="nomor">${ayat.nomor}</p>
        <p class="text-end arab">${ayat.ar}</p>
        <p class="latin">${ayat.tr}</p>
        <p class="arti">${ayat.idn}</p>
    </div>
</div>`;
    });
    document.querySelector('head>title').innerHTML = `${isi_surat.nomor}. ${isi_surat.nama_latin} ${isi_surat.nama} | Qur'an`;
    document.querySelector('nav h1.navbar-brand .title').innerHTML = `<span>${isi_surat.nomor}. ${isi_surat.nama_latin}</span><span class="text-end arab">${isi_surat.nama}</span>`;
    document.querySelector('body>.container').innerHTML = '<div class="row"><div class="col 12"></div></div>';
    document.querySelector('body>.container .row .col').innerHTML = card_surat_title + `<div class='ayat'>${card_ayat}</div>`;
};

function play_surat_audio() {
    document.querySelector('.card-surat-title .audio').innerHTML = `<audio controls autoplay>
    <source src="${isi_surat.audio}">
</audio><button class="btn btn-outline-secondary btn bg-body-tertiary stop" title="Stop" onclick="stop_surat_audio();">&Cross;</button>`;
};

function stop_surat_audio() {
    document.querySelector('.card-surat-title .audio').innerHTML = `<button class="btn bg-body-tertiary" onclick="play_surat_audio();"><span class="bi bi-play-fill"></span> Putar audio</button>`;
};

get_isi_surat(get_param('nomor'));

window.onload = function() {
    waitFor(_ => (isi_surat != undefined) === true).then(_ => {
        debuglog(isi_surat)
        debuglog('Done waiting for get_isi_surat');
        display_isi_surat();
    });
};