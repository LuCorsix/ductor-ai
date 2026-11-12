const { criarStorageJson } = require('./storage-json');
const { criarStoragePostgres } = require('./storage-postgres');

const dadosPadrao = () => ({
    chats: [],
    settings: { theme: 'dark', fontSize: 'normal', language: null },
    avatar: null
});

function erroEmailEmUso() {
    const e = new Error('EMAIL_TAKEN');
    e.code = 'EMAIL_TAKEN';
    return e;
}

function criarStorage(baseDir, opcoes = {}) {
    const url = opcoes.databaseUrl !== undefined ? opcoes.databaseUrl : process.env.DATABASE_URL;
    return url 
        ? criarStoragePostgres(url, baseDir, opcoes.Pool, opcoes.legacyDir, dadosPadrao, erroEmailEmUso) 
        : criarStorageJson(baseDir, dadosPadrao, erroEmailEmUso);
}

module.exports = { criarStorage, criarStorageJson, criarStoragePostgres, dadosPadrao };