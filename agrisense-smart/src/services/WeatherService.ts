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
    // Using Nominatim OpenStreetMap for better global city/village coverage
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                "Accept-Language": "en-US,en;q=0.9",
                "User-Agent": "AgriSenseApp/1.0"
            }
        });
        if (!response.ok) throw new Error("Geocoding failed");

        const data = await response.json();
        if (!data || data.length === 0) {
            throw new Error(`Location "${city}" not found.`);
        }

        const result = data[0];
        
        // Nominatim display_name is usually "City, District, State, Country"
        // Keep it clean (e.g. "Anakapalli, Andhra Pradesh")
        const nameParts = result.display_name.split(',');
        const shortName = nameParts.length > 1 
            ? `${nameParts[0].trim()}, ${nameParts[1].trim()}`
            : result.display_name;

        return {
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon),
            name: shortName,
        };
    } catch (error) {
        console.error("Geocoding error:", error);
        throw error;
    }
}
