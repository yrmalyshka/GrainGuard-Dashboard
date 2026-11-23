/**
 * Service API untuk komunikasi dengan modul ESP32 GrainGuard
 */

export const espApi = {
  /**
   * Mengambil data sensor dan aktuator dari ESP32 dengan pengukuran latency ping (ms)
   */
  async getSensorData(baseUrl) {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch(`${baseUrl}/data`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        latencyMs
      };
    } catch (err) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: err.name === 'AbortError' ? 'Koneksi timeout (> 2.5s)' : err.message,
        latencyMs: null
      };
    }
  },

  /**
   * Mengontrol kipas relay secara manual (state: 'on' | 'off')
   */
  async setFanState(baseUrl, state) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${baseUrl}/fan?state=${state}`, {
        method: 'POST',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const res = await response.json().catch(() => ({ status: 'ok' }));
      return { success: true, res };
    } catch (err) {
      clearTimeout(timeoutId);
      return { success: false, error: err.message };
    }
  },

  /**
   * Mengubah mode kontrol sistem (mode: 'auto' | 'manual')
   */
  async setSystemMode(baseUrl, mode) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${baseUrl}/mode?state=${mode}`, {
        method: 'POST',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const res = await response.json().catch(() => ({ status: 'ok' }));
      return { success: true, res };
    } catch (err) {
      clearTimeout(timeoutId);
      return { success: false, error: err.message };
    }
  },

  /**
   * Menguji konektivitas endpoint ESP32
   */
  async ping(baseUrl) {
    return this.getSensorData(baseUrl);
  }
};
