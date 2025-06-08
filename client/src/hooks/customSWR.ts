import useSWR from "swr";

export const fetcher = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);

    if(response.status === 401){
        localStorage.clear();
        window.location.href = '/login'
        return {
            status: 'unauthorized'
            message: 'Session expired, redirecting to login',
        };
    }

    if(!response.ok){
        throw new Error(`API request failed with status ${response.status}`);
    }

}