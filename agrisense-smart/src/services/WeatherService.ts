/**
 * Weather Service using Open-Meteo API (No API key required)
 */
import { API_BASE_URL } from "@/lib/api";

export interface WeatherData {
    temperature: number;
    humidity: number;
    rainfall: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    ph?: number;
    locationName?: string;
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/location-intel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lon }),
        });

        if (!response.ok) throw new Error("Location intelligence fetch failed");
        return await response.json();
    } catch (error) {
        console.error("Error fetching location data:", error);
        throw error;
    }
}

export async function getLocationCoords(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            (error) => {
                reject(new Error("Unable to retrieve your location. Please check your browser permissions."));
            }
        );
    });
}
export async function getCoordsFromCity(city: string): Promise<{ lat: number; lon: number; name: string }> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Geocoding failed");

        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error(`Location "${city}" not found.`);
        }

        const result = data.results[0];
        return {
            lat: result.latitude,
            lon: result.longitude,
            name: `${result.name}, ${result.admin1 || ''} ${result.country || ''}`.trim().replace(/\s\s+/g, ' '),
        };
    } catch (error) {
        console.error("Geocoding error:", error);
        throw error;
    }
}
