const path= require('path')

const motifUiFolder = path.resolve(__dirname,'./../src/server/motif-ui-components/')
const pathToMotifUiRepo = path.resolve(__dirname,'../../../../motif-ui/src')

const fs = require('fs');
const fse = require("fs-extra")
const http = require('http')

const options = {
    hostname: '0.0.0.0',
    port: 8080,
    path: '/api/components/update',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
}

async function readDirectory(directory) {
    return await fs.promises.readdir(directory, (err) => {
        if (err) {
            console.log("Could not list the directory.", err);
            process.exit(1);
        }
    });
}

async function readPackageJsons (files, destination){
    const components = []
    for (const file of files) {
        if(!file.includes('.')){
            await fs.promises.readFile(destination +'/' + file + '/package.json', 'utf8').then(function (result) {
                const compo = JSON.parse(result)
                if (compo.keywords !== undefined) {
                    components.push({name: compo.name, keywords: compo.keywords})
                }
            })
                .catch(function (err) {
                    console.log(err)
                })
        }
    }return components
}

function sendDataToHttpRequest(data){
    const req = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
            process.stdout.write(d)
        })
    })

    req.on('error', error => {
        console.error(error)
    })

    req.write(JSON.stringify(data))
    req.end()
}

async function handleImportProcess(source, destination){
    await fse.remove(destination)
        .then(()=> console.log('delete folder successfully'))
        .catch(err => console.log(err))
    await fse.copy(source, destination)
        .then(()=>console.log('copy folder successfully'))
        .catch(err => console.log(err))
    readDirectory(destination)
        .then((result)=>readPackageJsons(result, destination)).then((result)=>sendDataToHttpRequest(result))
}

handleImportProcess(pathToMotifUiRepo, motifUiFolder).then(()=>console.log('process finished'))








