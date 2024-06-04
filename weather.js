#!/usr/bin/env node
import { getArgs } from "./helpers/args.js"
import {
    printError,
    printHelp,
    printSuccess,
    printWeather
} from "./services/log.service.js"
import { getIcon, getWeather } from "./services/api.service.js";
import {
    getKeyValue,
    saveKeyValue,
    TOKEN_DICTIONARY
} from "./services/storage.service.js"

const saveToken = async (token) => {
    if (!token.length) {
        printError('Не передан token')
        return
    }
    try {
        await saveKeyValue('token', token)
        printSuccess('Токен сохранен')
    } catch (e) {
        printError(e.message)
    }
}

const saveCoords = async (lat, lon) => {
    if (!lat || !lon) {
        printError('Не переданы координаты')
        return;
    }
    try {
        await saveKeyValue(TOKEN_DICTIONARY.lat, lat)
        await saveKeyValue(TOKEN_DICTIONARY.lon, lon)
        printSuccess('Координаты сохранены')
    } catch (e) {
        printError(e.message);
    }
}

const getForecast = async () => {
    try {
        const lat = process.env.LAT ?? await getKeyValue(TOKEN_DICTIONARY.lat)
        const lon = process.env.LAT ?? await getKeyValue(TOKEN_DICTIONARY.lon)
        const weather = await getWeather(lat, lon)
        printWeather(weather, getIcon(weather.weather[0].icon))
    } catch (e) {
        if (e?.response?.status === 400) {
            printError('Неверно указаны координаты')
        } else if (e?.response?.status === 401) {
            printError('Неверно указан токен')
        } else {
            printError(e.message);
        }
    }
}

const initCLI = () => {
    const args = getArgs(process.argv)

    if (args.h) {
        return printHelp()
    }
    if (args.lat && args.lon) {
        return saveCoords(args.lat, args.lon)
    }
    if (args.t) {
        return saveToken(args.t)
    }

    return getForecast()
}

initCLI()
