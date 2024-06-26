import axios from "axios";

export async function predict(data: any) {
    try {
        const api_url = import.meta.env.VITE_API_URL;
        const body = { data };
        const header = {
            headers: {
                "Content-Type": "application/json",
            },
        }
        const response = await axios.post(`${api_url}/kmedoids`, body, header);
        return response.data
    } catch (error) {
        console.error("Error making prediction:", error);
        throw error;
    }
}
