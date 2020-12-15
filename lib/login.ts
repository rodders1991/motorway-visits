import axios from 'axios';

const LOGIN_ENDPOINT = 'https://motorway-challenge-api.herokuapp.com/api/login';

interface LoginResponse {
    token: string;
}

const login = async (): Promise<string> => {
    const { data } = await axios.get<LoginResponse>(LOGIN_ENDPOINT);

    return data.token;
};

export default login;
