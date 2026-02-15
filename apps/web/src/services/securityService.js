const API_URL = import.meta.env.VITE_API_URL || 'https://slotify-production-1fd7.up.railway.app/api';

const getHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
});

export const setup2FA = async (token) => {
    const response = await fetch(`${API_URL}/security/2fa/setup`, {
        method: 'POST',
        headers: getHeaders(token)
    });
    if (!response.ok) throw new Error('Failed to setup 2FA');
    return response.json();
};

export const verify2FA = async (token, verificationCode) => {
    const response = await fetch(`${API_URL}/security/2fa/verify`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ token: verificationCode })
    });
    if (!response.ok) throw new Error('Failed to verify 2FA');
    return response.json();
};

export const disable2FA = async (token) => {
    const response = await fetch(`${API_URL}/security/2fa/disable`, {
        method: 'POST',
        headers: getHeaders(token)
    });
    if (!response.ok) throw new Error('Failed to disable 2FA');
    return response.json();
};

export const exportUserData = async (token) => {
    const response = await fetch(`${API_URL}/security/data/export`, {
        method: 'GET',
        headers: getHeaders(token)
    });
    if (!response.ok) throw new Error('Failed to export data');
    return response.json();
};

export const deleteAccount = async (token) => {
    const response = await fetch(`${API_URL}/security/data/delete`, {
        method: 'POST',
        headers: getHeaders(token)
    });
    if (!response.ok) throw new Error('Failed to delete account');
    return response.json();
};
