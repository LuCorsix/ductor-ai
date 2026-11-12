const fs = require('fs');
const path = require('path');

function criarStorageJson(baseDir, dadosPadrao, erroEmailEmUso) {
    const arquivoUsuarios = path.join(baseDir, 'usuarios.json');
    const pastaDados = path.join(baseDir, 'dados_usuarios');

    function lerUsuarios() {
        try {
            if (!fs.existsSync(arquivoUsuarios)) return [];
            return JSON.parse(fs.readFileSync(arquivoUsuarios, 'utf8'));
        } catch (erro) {
            console.error('Erro ao ler usuarios.json:', erro);
            return [];
        }
    }

    function gravarAtomico(arquivo, conteudo) {
        const temporario = arquivo + '.tmp';
        fs.writeFileSync(temporario, conteudo);
        fs.renameSync(temporario, arquivo);
    }

    const caminhoDados = (id) => path.join(pastaDados, `${parseInt(id, 10)}.json`);

    return {
        tipo: 'json',

        async iniciar() {
            fs.mkdirSync(pastaDados, { recursive: true });
            if (!fs.existsSync(arquivoUsuarios)) gravarAtomico(arquivoUsuarios, '[]');
        },

        async buscarUsuarioPorEmail(email) {
            return lerUsuarios().find(u => String(u.email).trim().toLowerCase() === email) || null;
        },

        async buscarUsuarioPorId(id) {
            return lerUsuarios().find(u => u.id === id) || null;
        },

        async criarUsuario({ name, email, password }) {
            const usuarios = lerUsuarios();
            if (usuarios.some(u => String(u.email).trim().toLowerCase() === email)) throw erroEmailEmUso();
            const novo = {
                id: usuarios.reduce((maior, u) => Math.max(maior, u.id), 0) + 1,
                name, email, password
            };
            usuarios.push(novo);
            gravarAtomico(arquivoUsuarios, JSON.stringify(usuarios, null, 2));
            return novo;
        },

        async atualizarSenha(id, hash) {
            const usuarios = lerUsuarios();
            const alvo = usuarios.find(u => u.id === id);
            if (!alvo) return false;
            alvo.password = hash;
            gravarAtomico(arquivoUsuarios, JSON.stringify(usuarios, null, 2));
            return true;
        },

        async lerDados(id) {
            try {
                const arquivo = caminhoDados(id);
                if (!fs.existsSync(arquivo)) return dadosPadrao();
                const salvo = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
                const base = dadosPadrao();
                return { ...base, ...salvo, settings: { ...base.settings, ...(salvo.settings || {}) } };
            } catch (erro) {
                console.error('Erro ao ler dados do usuário:', erro);
                return dadosPadrao();
            }
        },

        async gravarDados(id, dados) {
            gravarAtomico(caminhoDados(id), JSON.stringify(dados));
        }
    };
}

module.exports = { criarStorageJson };