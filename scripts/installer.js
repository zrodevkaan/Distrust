﻿const fs = require('fs');
const path = require('path');
const readline = require('readline');
const distrustPath = path.resolve('distrust.js').replaceAll('\\','\\\\');
const args = process.argv.slice(2);
const version = args[1];

const Logger = {
    green: (message) => {
        console.log('\x1b[34m[Distrust] \x1b[0m\x1b[32m%s\x1b[0m', message);
    },
    red: (message) => {
        console.log('\x1b[34m[Distrust] \x1b[0m\x1b[31m%s\x1b[0m', message);
    },
    blue: (message) => {
        console.log('\x1b[34m[Distrust] \x1b[0m\x1b[34m%s\x1b[0m', message);
    },
    yellow: (message) => {
        console.log('\x1b[34m[Distrust] \x1b[0m\x1b[33m%s\x1b[0m', message);
    },
    rainbow: (message) => { // this was literally NOT needed. but I got bored making this.
        const colors = ['\x1b[31m', '\x1b[33m', '\x1b[32m', '\x1b[36m', '\x1b[34m', '\x1b[35m'];
        let coloredMessage = '';
        for (let i = 0; i < message.length; i++) {
            const color = colors[i % colors.length];
            coloredMessage += `${color}${message[i]}`;
        }
        coloredMessage += '\x1b[0m';
        console.log(coloredMessage);
    },
};

if (!version) {
    Logger.red('Please provide a version argument (e.g., Stable, Canary, Development).');
    process.exit(1);
}

const validVersions = {
    'Stable': 'Discord',
    'Canary': 'DiscordCanary',
    'Development': 'DiscordDevelopment',
    'PTB': 'DiscordPTB'
};

const baseFolderName = validVersions[version];

if (!baseFolderName) {
    Logger.red('Invalid version argument. Use "Stable", "Canary" or "Development".');
    process.exit(1);
}

const getAllUserProfiles = () => {
    const userProfiles = [];
    const usersDir = path.join(process.env.SYSTEMDRIVE, 'Users');
    const userFolders = fs.readdirSync(usersDir);

    userFolders.forEach(userFolder => {
        const profilePath = path.join(usersDir, userFolder);
        if (fs.lstatSync(profilePath).isDirectory()) {
            userProfiles.push(profilePath);
        }
    });

    return userProfiles;
};

function moveBuildFiles(selectedPath) {
    const buildPath = path.join(__dirname, '..', 'build');
    const preloadSrcPath = path.join(buildPath, 'preload.min.js');
    const rendererSrcPath = path.join(buildPath, 'renderer.min.js');
    const preloadDestPath = path.join(selectedPath, 'preload.min.js');
    const rendererDestPath = path.join(selectedPath, 'renderer.min.js');

    fs.copyFile(preloadSrcPath, preloadDestPath, (oopsie) => {
        if (oopsie) {
            Logger.red('Error moving preload.min.js:', oopsie);
            return;
        }
        Logger.green('preload.min.js moved successfully.');
    });

    fs.copyFile(rendererSrcPath, rendererDestPath, (whoopsie) => {
        if (whoopsie) {
            Logger.red('Error moving renderer.min.js:', whoopsie);
            return;
        }
        Logger.green('renderer.min.js moved successfully.');
    });
}

const findHighestVersionFolder = (basePath, prefix) => {
    const folders = fs.readdirSync(basePath).filter(folder => {
        return folder.startsWith(prefix) && fs.lstatSync(path.join(basePath, folder)).isDirectory();
    });

    if (folders.length === 0) {
        return null;
    }

    folders.sort((a, b) => {
        const versionA = parseInt(a.replace(prefix, ''));
        const versionB = parseInt(b.replace(prefix, ''));
        return versionB - versionA;
    });

    return folders[0];
};

const findDiscordPaths = (profilePath) => {
    const targetPaths = [];
    const basePath = path.join(profilePath, 'AppData', 'Local', baseFolderName);
    if (fs.existsSync(basePath)) {
        const appFolders = fs.readdirSync(basePath).filter(folder => {
            const fullPath = path.join(basePath, folder);
            return folder.startsWith('app') && fs.lstatSync(fullPath).isDirectory();
        });

        appFolders.sort().forEach(appFolder => {
            const modulesPath = path.join(basePath, appFolder, 'modules');
            if (fs.existsSync(modulesPath)) {
                const highestVersionFolder = findHighestVersionFolder(modulesPath, 'discord_desktop_core-');
                if (highestVersionFolder) {
                    const targetPath = path.join(modulesPath, highestVersionFolder, 'discord_desktop_core');
                    if (fs.existsSync(targetPath)) {
                        targetPaths.push(targetPath);
                    }
                }
            }
        });
    }

    return targetPaths;
};

const userProfiles = getAllUserProfiles();
const allTargetPaths = [];

userProfiles.forEach(profilePath => {
    const discordPaths = findDiscordPaths(profilePath);
    if (discordPaths.length > 0) {
        discordPaths.forEach(targetPath => {
            allTargetPaths.push({ userProfile: profilePath, path: targetPath });
        });
    }
});

if (allTargetPaths.length === 0) {
    Logger.rainbow(`OOPSIE WOOPSIE!! Uwu We made a fluffity fluff!! A wittle oopsie woopsie! The code monkeys at our headquarters are working VERY HARD to fix this! (or just download ${version})`);
    process.exit(1);
}

Logger.yellow('We found more then one discord on your machine. Where would you like to install it?:');
allTargetPaths.forEach((target, index) => {
    Logger.green(`${index + 1}: ${target.path} (User Profile: ${target.userProfile})`);
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const selectTargetPath = (selectedPath) => {
    const indexPath = path.join(selectedPath, 'index.js');

    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
            Logger.red('Error reading index.js:', err);
            rl.close();
            return;
        }

        rl.question(`Are you sure you want to install it to "${selectedPath}"? (yes/no): `, (confirmation) => {
            if (confirmation.toLowerCase() === 'yes' || confirmation.toLowerCase() === 'y') {
                const modifiedContent = modifyIndexFile();
                fs.writeFile(indexPath, modifiedContent, (err) => {
                    if (err) {
                        Logger.red('Error writing to index.js:', err);
                        rl.close();
                        return;
                    }
                    Logger.green('index.js modified successfully.');
                    moveBuildFiles(selectedPath)
                    rl.close();
                });
            } else {
                Logger.green('Installation cancelled.');
                rl.close();
            }
        });
    });
};

function modifyIndexFile() {
    return `require(\`${distrustPath}\`);\nmodule.exports = require('./core.asar');`;
}

if (allTargetPaths.length === 1) {
    const selectedPath = allTargetPaths[0].path;
    Logger.green(`Automatically selected target path: ${selectedPath}`);
    selectTargetPath(selectedPath);
}