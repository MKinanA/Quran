let daftar_surat, isi_surat, DEBUG_MODE;
const cari_surat = document.querySelector('nav form input.form-control');
DEBUG_MODE = true;
isi_surat = Array(114);

if ('serviceWorker' in navigator) { // registering Service Worker
    navigator.serviceWorker.register('sw.js')
    .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(error => {
        console.log('Service Worker registration failed:', error);
    })
};

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

function get_daftar_surat() {
    fetch('https://equran.id/api/surat').then(response => response.json()).then(response => {
        daftar_surat = response;
    }).catch(error => loading(`${error}, check your connection and refresh`));
};

function get_isi_surat(nomor) {
    debuglog('Starting to fetch for isi_surat[' + (nomor - 1) + ']');
    fetch('https://equran.id/api/surat/' + nomor).then(response => response.json()).then(response => {
        isi_surat[nomor - 1] = response;
    });
    waitFor(_ => (isi_surat[nomor - 1] != undefined) === true).then(_ => debuglog('Fetched isi_surat[' + (nomor - 1) + '] (' + isi_surat[nomor - 1].nama_latin + ')'));
};

function get_isi_surat_loop() {
    debuglog('Starting to fetch for isi_surat');
    daftar_surat.forEach(surat => {
        get_isi_surat(surat.nomor - 1);
    });
    waitFor(_ => (isi_surat.includes(undefined)) === true).then(_ => debuglog('Done fetching all isi_surat'));
};

function display_loading() {
    document.querySelector('body>.container').innerHTML = `
<div class="loading-container">
    <div class="loading-circle"></div>
</div>`;
};

function display_surat() {
    debuglog('Starting display_surat');
    let card_surat = '';
    daftar_surat.forEach(surat => {
        card_surat += `
<div class="col-lg-3 col-md-4 col-sm-12">
    <div class="card mb-3 card-surat" onclick="location.href='surat?nomor=${surat.nomor}'">
        <div class="card-body">
            <h5 class="card-title arab"><span>${surat.nomor}. ${surat.nama_latin}</span><span class="jumlah-ayat">${surat.jumlah_ayat} ayat</span></h5>
            <h3 class="card-subtitle mb-2 text-end">${surat.nama}</h3>
            <p class="card-text text-end"><span>${JSON.parse('{"mekah":"Makkiyyah","madinah":"Madaniyyah"}')[surat.tempat_turun]}</span><span class='dot'>•</span><span>${surat.arti}</span></p>
        </div>
    </div>
</div>`;
    });
    document.querySelector('body>.container').innerHTML = '<div class="row"></div>';
    document.querySelector('body>.container .row').innerHTML = card_surat;
};

function display_cari_surat() {
    debuglog('display_cari_surat() is called');
    if (cari_surat.value == '') {
        debuglog('query is empty, using display_surat instead');
        display_surat();
    } else {
        let card_surat = '', card_surat_inactive = '';
        const query = cari_surat.value.toLowerCase();
        debuglog('query is ' + query);
        daftar_surat.forEach(surat => {
            if (surat.nama.toLowerCase().includes(query) || surat.nama_latin.toLowerCase().includes(query) || surat.arti.toLowerCase().includes(query) || surat.nomor === parseInt(query) || JSON.parse('{"mekah":"Makkiyyah","madinah":"Madaniyyah"}')[surat.tempat_turun].toLowerCase() === query) {
                card_surat += `
<div class="col-lg-3 col-md-4 col-sm-12">
    <div class="card mb-3 card-surat" onclick="location.href='surat?nomor=${surat.nomor}'">
        <div class="card-body">
            <h5 class="card-title arab"><span>${surat.nomor}. ${surat.nama_latin}</span><span class="jumlah-ayat">${surat.jumlah_ayat} ayat</span></h5>
            <h3 class="card-subtitle mb-2 text-end">${surat.nama}</h3>
            <p class="card-text text-end"><span>${JSON.parse('{"mekah":"Makkiyyah","madinah":"Madaniyyah"}')[surat.tempat_turun]}</span><span class='dot'>•</span><span>${surat.arti}</span></p>
        </div>
    </div>
</div>`;
            } else {
                card_surat_inactive += `
<div class="col-lg-3 col-md-4 col-sm-12">
    <div class="card mb-3 card-surat card-surat-inactive" onclick="location.href='surat?nomor=${surat.nomor}'">
        <div class="card-body">
            <h5 class="card-title arab"><span>${surat.nomor}. ${surat.nama_latin}</span><span class="jumlah-ayat">${surat.jumlah_ayat} ayat</span></h5>
            <h3 class="card-subtitle mb-2 text-end">${surat.nama}</h3>
            <p class="card-text text-end"><span>${JSON.parse('{"mekah":"Makkiyyah","madinah":"Madaniyyah"}')[surat.tempat_turun]}</span><span class='dot'>•</span><span>${surat.arti}</span></p>
        </div>
    </div>
</div>`;
            };
        });
        document.querySelector('body>.container').innerHTML = '<div class="row"></div>';
        document.querySelector('body>.container .row').innerHTML = card_surat + card_surat_inactive;
    };
};

get_daftar_surat();

window.onload = function() {
    waitFor(_ => (daftar_surat != undefined) === true).then(_ => {
        debuglog(daftar_surat)
        debuglog('Done waiting for get_daftar_surat');
        display_cari_surat();
    });
};