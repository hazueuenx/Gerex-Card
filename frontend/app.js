const API = "http://localhost:3000/api";

const inputNama = document.getElementById("inputNama");
const filterJurusan = document.getElementById("filterJurusan");
const filterGugus = document.getElementById("filterGugus");
const btnCari = document.getElementById("btnCari");
const btnReset = document.getElementById("btnReset");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const statusBar = document.getElementById("statusBar");
const statusText = document.getElementById("statusText");
const cardGrid = document.getElementById("cardGrid");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

async function init() {
    await loadFilters();
    await cariMahasiswa();
}

async function loadFilters() {
    try {
        const [resJurusan, resGugus] = await Promise.all([
            fetch(`${API}/jurusan`),
            fetch(`${API}/gugus`),
        ]);

        const jurusanList   = await resJurusan.json();
        const gugusList  = await resGugus.json();

        jurusanList.forEach((j) => {
            const opt = document.createElement("option");
            opt.value = j;
            opt.textContent = j;
            filterJurusan.appendChild(opt);
        });

        gugusList.forEach((a) => {
            const opt = document.createElement("option");
            opt.value = a;
            opt.textContent = `Gugus ${a}`;
            filterGugus.appendChild(opt);
        });
    } 
    catch (err) {
        console.error("Gagal load filter:", err);
    }
}

async function cariMahasiswa() {
    setLoading(true);

    const params = new URLSearchParams();
    if (inputNama.value.trim()) params.set("nama", inputNama.value.trim());
    if (filterJurusan.value !== "semua") params.set("jurusan", filterJurusan.value);
    if (filterGugus.value !== "semua") params.set("gugus", filterGugus.value);

    try {
        const res  = await fetch(`${API}/mahasiswa?${params}`);
        const json = await res.json();
        renderCards(json.data, json.total);
    } 
    catch (err) {
        console.error("Gagal fetch:", err);
        renderError();
    } 
    finally {
        setLoading(false);
    }
}

function renderCards(data, total) {
    cardGrid.innerHTML = "";

    if (data.length === 0) {
        emptyState.classList.remove("hidden");
        statusBar.classList.add("hidden");
        return;
    }

    emptyState.classList.add("hidden");
    statusBar.classList.remove("hidden");
    statusText.innerHTML = `Menampilkan <span>${total}</span> mahasiswa`;

    data.forEach((mhs) => {
        const card = document.createElement("div");
        card.className = "maba-card";
        card.innerHTML = `
        <div class="card-avatar">${getAvatar(mhs.nama)}</div>
        <div class="card-nama">${mhs.nama}</div>
        <div class="card-nrp">${mhs.nrp}</div>
        <span class="card-tag">${mhs.jurusan}</span>
        <span class="card-tag gugus">${mhs.gugus}</span>
        `;
        card.addEventListener("click", () => bukaModal(mhs));
        cardGrid.appendChild(card);
    });
}

function bukaModal(mhs) {
    modalContent.innerHTML = `
        <div class="modal-avatar">${getAvatar(mhs.nama)}</div>
        <div class="modal-nama">${mhs.nama}</div>
        <div class="modal-nrp">NRP: ${mhs.nrp}</div>
        <hr class="modal-divider" />
        <div class="modal-row">
        <span class="modal-label">Jurusan</span>
        <span class="modal-value">${mhs.jurusan}</span>
        </div>
        <div class="modal-row">
        <span class="modal-label">Gugus</span>
        <span class="modal-value">${mhs.gugus}</span>
        </div>
    `;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function tutupModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
}

function getAvatar(nama) {
    const emojis = ["🧑‍💻","👩‍💻","👨‍🎓","👩‍🎓","🧑‍🎓","👨‍💼","👩‍💼","🧑‍🔬"];
    const idx = nama.charCodeAt(0) % emojis.length;
    return emojis[idx];
}

function setLoading(state) {
    loadingState.style.display = state ? "block" : "none";
    if (state) {
        cardGrid.innerHTML = "";
        emptyState.classList.add("hidden");
        statusBar.classList.add("hidden");
    }
}

function renderError() {
    cardGrid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:#6b7a99;">
        <p style="font-size:16px; font-weight:600; margin-bottom:8px;">⚠️ Tidak dapat terhubung ke server</p>
        <small>Pastikan backend sudah berjalan di <code>http://localhost:3000</code></small>
        </div>
    `;
}

btnCari.addEventListener("click", cariMahasiswa);

inputNama.addEventListener("keydown", (e) => {
    if (e.key === "Enter") cariMahasiswa();
});

btnReset.addEventListener("click", () => {
    inputNama.value = "";
    filterJurusan.value = "semua";
    filterGugus.value = "semua";
    cariMahasiswa();
});

modalClose.addEventListener("click", tutupModal);
modal.addEventListener("click", (e) => {
    if (e.target === modal) tutupModal();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") tutupModal();
});

init();