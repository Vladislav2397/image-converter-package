const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// Получение пути к конфигурационному файлу из аргументов командной строки
const args = process.argv.slice(2)
const configPathArgIndex = args.indexOf('--config')
const configPath =
    configPathArgIndex !== -1
        ? args[configPathArgIndex + 1]
        : 'image-converter.config.json'
const absoluteConfigPath = path.resolve(process.cwd(), configPath)

const config = fs.existsSync(absoluteConfigPath)
    ? require(absoluteConfigPath)
    : {}

const inputDir = config.inputDir
    ? path.resolve(process.cwd(), config.inputDir)
    : path.resolve(process.cwd(), 'images')
const outputDir = config.outputDir
    ? path.resolve(process.cwd(), config.outputDir)
    : path.resolve(process.cwd(), 'converted-images')
const formats = config.formats || ['webp']

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
}

fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error(`Error reading input directory: ${err.message}`)
        process.exit(1)
    }

    files.forEach((file) => {
        const inputFilePath = path.join(inputDir, file)
        const fileName = path.parse(file).name

        formats.forEach((format) => {
            const outputFilePath = path.join(outputDir, `${fileName}.${format}`)
            sharp(inputFilePath)
                .toFormat(format)
                .toFile(outputFilePath, (err) => {
                    if (err) {
                        console.error(
                            `Error converting ${file} to ${format}: ${err.message}`
                        )
                    } else {
                        console.log(
                            `Converted ${file} to ${format} at ${outputFilePath}`
                        )
                    }
                })
        })
    })
})
