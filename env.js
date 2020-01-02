/*****************************
* environment.js
******************************/

const envType = 'dev'

const ENV = {
    dev: {
        AZURE_KEY: 'a9312d632s48g744v026079h24b07'
    },
    prod: {
        GMAPS_API_KEY: ''
    }
};

const getEnvVars = () => {
    return envType == 'prod' ? ENV.prod : ENV.dev
};

export default getEnvVars;