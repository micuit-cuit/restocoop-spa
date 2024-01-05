require('json5/lib/register');
require('dotenv').config();
const json5 = require('json5');
const express = require('express');
const http = require('http');
const fs = require('fs');
const {start,Log} = require('./log.js');
const { Sequelize, DataTypes } = require('sequelize');
const browserDectect = require('browser-detect')
const HTMLParser = require('node-html-parser');
const config = require('./config.json5');
const root = require('./src/router.js').routes;
const log = new Log();

function parseRoute(route) {
    let routes = [];
    for (let key in route) {
        //les routes sont stocké en 'GET /' : 'index.html'
        //on split la route pour avoir la methode et l'url
        let routeSplit = key.split(' ');
        //on recupere la methode
        let method = routeSplit[0];
        let url = routeSplit[1];
        let page = route[key];
        let routeObj = {
            method: method,
            url: url,
            page: page
        }
        routes.push(routeObj);
    }
    return routes;
}
const routeParsed = parseRoute(root);

//test l'existence du dossier temp, page et components et les creer si il n'existe pas
for (let i = 0; i < config.tempFile.length ; i++) {
    const tempFile = config.tempFile[i];
    if (fs.existsSync(tempFile)) {
        fs.rmSync(tempFile, { recursive: true });
    }
    fs.mkdirSync(tempFile);
    console.log('\x1b[1;31mpurge du dossier '+tempFile+', '+(i+1)+'/'+config.tempFile.length+'\x1b[0m');
}
if (!fs.existsSync(config.path.page)) {
    fs.mkdirSync(config.path.page);
    console.log('\x1b[1;31mLe dossier page n\'existe pas, il a été crée\x1b[0m');
}
if (!fs.existsSync(config.path.component)) {
    fs.mkdirSync(config.path.component);
    console.log('\x1b[1;31mLe dossier components n\'existe pas, il a été crée\x1b[0m');
}
const app = express();
const server = http.createServer(app);
app.get('/PKILL', (req, res) => {
    res.send('server killed');
    process.exit(0);
});
app.get('*', (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }
    let userAgent = req.headers['user-agent'];
    //optien le navigateur, l'os et la version du navigateur ou determine si c'est un bot
    let browser = browserDectect(userAgent);
    //si son navigateur est un chrome < 20, un firefox < 15, un safari < 6.0, un opera < 15 ou un ie < 79 alors il est redirigé vers une page d'erreur
    if (browser.name == 'chrome' && browser.version < 20 || browser.name == 'firefox' && browser.version < 15 || browser.name == 'safari' && browser.version < 6.0 || browser.name == 'opera' && browser.version < 15 || browser.name == 'ie' && browser.version < 79) {
        res.sendFile(config.pathNavError);
        return;
    }

    let date = new Date();
    let dateNow = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
    //affiche en vert les adresse ip de l'utilisateur , le user agent en bleu et la date en jaune
    let reqUrl = req.url;
    //si l'url contient un ? alors on suprime tout ce qui est apret le ?
    if (reqUrl.includes('?') && !config.devMode){
        reqUrl = reqUrl.split('?')[0];
    }
    console.log(`\x1b[1;33m [${dateNow}] \x1b[1;31m${ip} \x1b[1;34m${browser.name} \x1b[1;35m${browser.version} \x1b[1;36m${browser.os}  \x1b[1;31m${reqUrl}\x1b[0m`);
    next();

});
function build(config) {
    //efface le dossier temp
    console.log('\x1b[1;33mSupression du dossier temp...\x1b[0m');
    fs.rmSync(config.path.temp, { recursive: true });
    //creer le dossier temp
    fs.mkdirSync(config.path.temp);
    console.log('\x1b[1;33mBuild en cours...\x1b[0m');
    //recupere les pages dans le dossier pages
    let pages = fs.readdirSync(config.path.page);
    pages = pages.filter(page => page.includes('.html'));
    //calcule la cantité de page a build
    let pagesLength = pages.length;
    //calcule le pourcentage de chaque page
    let pourcentage = 100 / pagesLength;
    //calcule le pourcentage total
    let pourcentageTotal = 0;
    let index = 0;
    //suprime les pages qui ne sont pas des fichiers html
    pages.forEach(page => {
        //calcule le pourcentage total
        pourcentageTotal += pourcentage;
        index++;
        //affiche le pourcentage total
        console.log('\x1b[1;33mBuild en cours... ' + page + ", " + index + ' page(s) sur ' + pagesLength + ' page(s) build (' + Math.round(pourcentageTotal) + '%)\x1b[0m');
        let htmlFile = pageResolution(config.path.page + '/' + page, config);
        htmlFile = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    ${htmlFile}
</body>
</html>`
        //dans le dossier temp on creer un fichier html avec le contenu de la page
        //lit le css global et ajoute dans le fichier html
        let cssGlobal = fs.readFileSync(config.path.globalCss, 'utf8', (err, data) => {
            console.log("\x1b[1;31mErreur l'ors de la lecture du fichier css global: " + config.path.globalCss + "\n " + err + "\x1b[0m");
        });
        let jsGlobal = fs.readFileSync(config.path.globalJs, 'utf8', (err, data) => {
            console.log("\x1b[1;31mErreur l'ors de la lecture du fichier js global: " + config.path.globalJs + "\n " + err + "\x1b[0m");
        });
        //ajoute le css global dans le fichier html
        let style = " <style>" + cssGlobal + "</style> <script>" + jsGlobal + "</script>";
        //ajoute le style dans le fichier html
        htmlFile = htmlFile.replace('</head>', style + '</head>');
        fs.writeFileSync(config.path.temp + '/' + page, htmlFile);
    });
    console.log('\x1b[1;33mBuild terminé\x1b[0m');

}
function pageResolution(page, config) {

    //recupere le contenu de la page et appelle la fonction htmlParser
    let html = fs.readFileSync(page, 'utf8', (err, data) => {
        console.log("\x1b[1;31mErreur l'ors de la lecture du fichier html de la page: " + page + "\n " + err + "\x1b[0m");
    });
    let htmlFile = htmlParser(html, config);
    //pour chaque element component dans le fichier html
    htmlFile.querySelectorAll('component').forEach(component => {
        //recupere le nom du component
        let name = component.getAttribute('src');
        //recupere tout les variable du component et les stock dans un objet (variable="['Nos Produits Phares', 'Nos Produits Phares2']" => ['Nos Produits Phares', 'Nos Produits Phares2'])
        let attribut = component.getAttribute('variable');
        let variableAtribut = []
        if (attribut != undefined) { 
            try {
                variableAtribut = json5.parse(attribut)
            } catch (error) {
                console.log("\x1b[1;31mErreur l'ors de la lecture des variables du component: " + name + "\n " + error + "\x1b[0m");
            }
        }
        //recupere le contenu du component
        let path = name
        //si name contient un / alors 
        if (name.includes('/')) {
            name = name.split('/');
            //recupere le dernier element du tableau name
            name = name[name.length - 1];
        }
        if (!fs.existsSync(config.path.component + '/' + path + '/' + name + '.html')) {
            console.log("\x1b[1;31mErreur le component: " + name + " n'existe pas, sons chemin devrait etre: " + config.path.component + '/' +path+ '/' + name + '.html\x1b[0m');
            return;
        }
        // let componentContent = fs.readFileSync(config.path.component + '/' + path + '/' + name + '.html', 'utf8', (err, data) => { 
        //     console.log("\x1b[1;31mErreur l'ors de la lecture du fichier html du component: " + name + "\n " + err + "\x1b[0m");
        // });
        //appelle la fonction htmlParser
        let componentContentFile = pageResolution(config.path.component + '/' + path + '/' + name + '.html', config);
        //remplace le component par le contenu du component
        let iframeId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        let outHtml
        if (config.componentIframe) {
            outHtml = `<iframe id="${iframeId}" srcdoc="${variableAtribut.length > 0 ? variableAtribut != undefined ? `<script>window.${name} = ${JSON.stringify(variableAtribut)};</script>` : '' : ''}${componentContentFile.toString().replace(/"/g, "'").replace(/\n/g, '')}" style="width: 100%; border: none;"></iframe>`;
        }else {
            outHtml = `<div id="${iframeId}">${variableAtribut.length > 0 ? variableAtribut != undefined ? `<script>window.${name} = ${JSON.stringify(variableAtribut)};</script>` : '' : ''}${componentContentFile.toString()}</div>`;
        }
        component.replaceWith(outHtml);
    });
    //pour chaque element linkFile dans le fichier html
    htmlFile.getElementsByTagName('linkFile').forEach(linkFile => {
        //recupere le nom du linkFile
        let type = linkFile.getAttribute('rel');
        let link = linkFile.getAttribute('href');
        //recupere tout les attribut du linkFile
        let attribut = linkFile.attributes;
        //suprime les attribut type et href du attribut
        delete attribut.rel;
        delete attribut.href;

        //recupere le contenu du linkFile
        let htmlFilelinkFile = linkFileAnaliseur(type, link, page, config, attribut);
        linkFile.replaceWith(htmlFilelinkFile);
    });
    return htmlFile.toString();
}
function htmlParser(html, config) {
    //parse le html
    let root = HTMLParser.parse(html);
    return root;
}
function linkFileAnaliseur(type, link, page, config, attribut = {}) {
    //verifie si le fichier existe
    let name = page
    //recupere le contenu du component
    let path = name
    //si name contient un / alors 
    if (name.includes('/')) {
        name = name.split('/');
        //recupere le dernier element du tableau name
        name = name[name.length - 1];
    }
    //suprime l'exention du fichier
    path = path.split('/').slice(0, -1).join('/')
    let completeLink = path + '/' + link;
    if (!fs.existsSync( completeLink)) {
        console.log("\x1b[1;31mErreur le fichier: " + link + " n'existe pas, sons chemin devrait etre: " +completeLink+'\x1b[0m');
        return;
    }
    let componentContent = fs.readFileSync( completeLink, 'utf8', (err, data) => { 
        console.log("\x1b[1;31mErreur l'ors de la lecture du fichier html du component: " + completeLink + "\n " + err + "\x1b[0m");
    });
    //pour chaque attribut du linkFile on crée un string avec le nom de l'attribut et sa valeur
    let attributString = '';
    for (let key in attribut) {
        if (attribut[key] == '') {
            attributString += key + ' ';
        }else{
            attributString += key + '="' + attribut[key] + '" ';
        }
    }
    switch (type) {
        case 'stylesheet':
            return `<style ${attributString} >${componentContent}</style>`;
            break;
        case 'javascript':
            return `<script ${attributString} >${componentContent}</script>`;
            break;
        default:
            console.log("\x1b[1;31mErreur le type: " + type + " n'est pas reconnu, les types reconnu sont:\n \x1b[1;32m-stylesheet\n \x1b[1;33m-javascript\x1b[0m");
            return;
            break;
    }
}
build(config);
app.use('/media', express.static(config.path.media));
if (config.devtool.httpProxi) {
    app.get('/api/redirect', (req, res) => {
        let url = req.query.url;
        if (!url) {
            res.send('Erreur, veuillez renseigner l\'url');
            return;
        }
        fetch(url).then(response => {
            res.send(response.body);
        }
        );
    });
}
app.get('/api', (req, res) => {
    //recupere tout les api
    let api = fs.readdirSync(config.path.api);
    api = api.filter(api => api.includes('.js'));
    //renvoie la liste des api disponible en html
    let html = '<ul>';
    api.forEach(api => {
        html += '<li><a href="/api/' + api.split('.')[0] + '">' + api.split('.')[0] + '</a></li>';
    }
    );
    html += '</ul>';
    res.send(html);
});
app.get('/api/:api*', async (req, res) => {
    //color blue pour l'url et vert pour le nom de la page
    //récupere l'argument de l'api (apret le /api/$api/)
    let arg1 = req.params[0]
    let arg = []

    //rajoute les argument de l'url (apret le ?)
    if (req.url.split("?").length > 1) {
        arg.push({})
        for (let i = 0; i < req.url.split("?")[1].split("&").length; i++) {
            arg[0][req.url.split("?")[1].split("&")[i].split("=")[0]] = req.url.split("?")[1].split("&")[i].split("=")[1]
        }
    }
    for (let i = 0; i < arg1.split("/").length; i++) {
        if (arg1.split("/")[i] == "") {
            continue;
        }
        arg.push(arg1.split("/")[i])
    }
    if (config.devMode){
        log.l('api: ' + req.params.api);
        log.l('arg: ' + JSON.stringify(arg));
        log.l('chemin de l\'api: ' + config.path.api + req.params.api + ".js");
    }
    if (fs.existsSync(config.path.api + req.params.api + ".js")) {
        //si oui, appel l'api
        const api = require(config.path.api + req.params.api + ".js");
        api.execute({apiKeys: process.env.COMMERCE_JS_API, config: config, res: res, arg: arg, req: req, client, models: {Sequelize,UserDB,Produit,Category}});
    } else {
        res.send("api not found");
    }
});
app.get('/*', (req, res) => {
    const method = 'GET';
    const url = req.url;
    if (url == '/favicon.ico') {
        res.send('');
        return;
    }
    if (config.devMode) {
        const time = new Date();
        build(config);
        log.l('temps de build: ' + (new Date() - time) + 'ms');
    }
    let page = null;
    for (let i = 0; i < routeParsed.length; i++) {
        const route = routeParsed[i];
        //test si la route corespond, le * est un caractere speciaux qui signifie tout
        //decoupe l'url pour l'analyser et la comparer a la route
        let urlSplit = url.split('/');
        let routeSplit = route.url.split('/');
        //analyse l'url et la route pour voir si elle corespond
        let urlTest = false;
        for (let i = 0; i < urlSplit.length; i++) {
            const urlPart = urlSplit[i];
            const routePart = routeSplit[i];
            if (urlPart == routePart || routePart == '*') {
                urlTest = true;
            } else {
                urlTest = false;
                break;
            }
        }
        //si la route corespond alors on recupere la page
        if (urlTest && method == route.method) {
            page = route;
            break;
        }
    }
    //si la page n'existe pas alors on renvoie une page d'erreur
    if (!page) {
        res.sendFile(config.pathError);
        return;
    }
    //si la page existe alors on renvoie la page
    res.send(fs.readFileSync(config.path.temp + '/' + page.page, 'utf8', (err, data) => {
        console.log("\x1b[1;31mErreur l'ors de la lecture du fichier html de la page: " + config.path.temp + '/' + page.page + "\n " + err + "\x1b[0m");
        req.send('Erreur l\'ors de la lecture de la page, veuillez ressayer ou contacter le support');
    }));
});
//dectecte si le port est deja utilisé
//verifie si un fichier de demarage existe (start.js)
//si oui, l'execute
if (config.path.startJs) {
    if (fs.existsSync(config.path.startJs)) {
        require(config.path.startJs).execute({ config: config, server: server });
    }
}

const client = new Sequelize('restocoopDEV', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});
//quand la base de donnée est connecté
const UserDB = client.define('userdb', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING(255),
    },
});
const Produit = client.define('Produit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    categoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    poids: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    prix: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    fournisseurID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT,
    },
});
const Category = client.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        required: true,
    },
    description: {
        type: DataTypes.TEXT,
    },
    imageUrl: {
        type: DataTypes.STRING,
        required: true,
    }
});
const Fournisseur = client.define('Fournisseur', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    label: {
        type: DataTypes.STRING,
        required: true,
    },
    categoryIDs: {
        type: DataTypes.STRING,
        required: true,
    },
    name: {
        type: DataTypes.STRING,
        required: true,
    },
    firstname: {
        type: DataTypes.STRING,
        required: true,
    },
    adress: {
        type: DataTypes.STRING,
        required: true,
    },
    phone: {
        type: DataTypes.STRING,
        required: true,
    },
    email: {
        type: DataTypes.STRING,
        required: true,
    },
    status: {
        type: DataTypes.STRING,
        required: true,
    },
    sosialMedia: {
        type: DataTypes.TEXT,
    },
    description: {
        type: DataTypes.TEXT,
    },
    reseauPro: {
        type: DataTypes.STRING,
    },
    imageUrls: {
        type: DataTypes.STRING,
    },
    videoUrls: {
        type: DataTypes.STRING,
    },
    adhesionRestocoopDate: {
        type: DataTypes.DATE,
    },
    idAdhesionRestocoop: {
        type: DataTypes.INTEGER,
    },
    regimeTva: {
        type: DataTypes.DOUBLE,
        required: true,
    },
    modalitesLivraison: {
        type: DataTypes.STRING,
        required: true,
    },
    minCommande: {
        type: DataTypes.INTEGER,
    },
    minCommandeType: {
        type: DataTypes.STRING,
    },
    certificats: {
        type: DataTypes.STRING,
    },
    certificatsDate: {
        type: DataTypes.DATE,
    },
    fournisseurAmont: {
        type: DataTypes.TEXT,
    },
    fournisseurAval: {
        type: DataTypes.TEXT,
    },
    cooperation: {
        type: DataTypes.STRING,
    },
    cooperationDate: {
        type: DataTypes.DATE,
    }
});



client.sync()
    .then(() => {
        log.l('Connecté à la base de données');
        start({ app, port: config.port, f: () => { log.l('Serveur démarré'); } });
    })
    .catch((err) => {
        console.error('Erreur lors de la connexion à la base de données :', err);
    });
  