import fs from "fs";
import * as path from "path";

const defaultSetting = {
    from: "./statics",
    dest: "./build/statics",
    force: true,
    dereference: true,
    errorOnExist: false,
    preserveTimestamps: true,
    recursive: true
}

export default (option = defaultSetting) => {
    const settings = {
        ...defaultSetting,
        ...Object.fromEntries(
            Object.entries(option).filter(([, value]) => value !== undefined)
        )
    };
    let plugin = {
        name: 'copy',
        setup(build) {
            // needs node version >= 18
            build.onEnd(() => {
                    let destDir = path.dirname(settings.dest)
                    if (!fs.existsSync(destDir)){
                        fs.mkdirSync(destDir, { recursive: true });
                    }
                    fs.cpSync(
                        settings.from,
                        settings.dest,
                        settings)
                }
            )
        },
    }
    return plugin
}
