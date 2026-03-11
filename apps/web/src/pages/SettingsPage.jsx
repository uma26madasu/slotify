import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, User, Lock, Download, Trash2, Check, AlertTriangle, Calendar, RefreshCw, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import * as securityService from '../services/securityService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://slotify-production-1fd7.up.railway.app';

const SettingsPage = ({ user }) => {
    const [activeTab, setActiveTab] = useState('profile');

    // Passing user token down would be ideal, for now assuming we can get it or user prop has it
    const token = user?.accessToken || user?.token;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'calendars', label: 'Calendars', icon: Calendar },
        { id: 'security', label: 'Security & 2FA', icon: Shield },
        { id: 'team', label: 'Team Management', icon: Users },
        { id: 'compliance', label: 'Compliance & Data', icon: FileText },
    ];

    return (
        <div className="flex h-full bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800">Settings</h2>
                </div>
                <nav className="flex-1 space-y-1 px-3">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="mr-3 h-5 w-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'profile' && <ProfileSettings user={user} />}
                    {activeTab === 'calendars' && <CalendarSettings user={user} />}
                    {activeTab === 'security' && <SecuritySettings user={user} token={token} />}
                    {activeTab === 'team' && <TeamSettings />}
                    {activeTab === 'compliance' && <ComplianceSettings token={token} />}
                </div>
            </div>
        </div>
    );
};

const ProfileSettings = ({ user }) => (
    <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-4">
            <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                    type="text"
                    defaultValue={user?.name}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    disabled
                    defaultValue={user?.email}
                    className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500 sm:text-sm cursor-not-allowed"
                />
            </div>
        </div>
    </div>
);

const CalendarSettings = ({ user }) => {
    const [googleStatus, setGoogleStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [message, setMessage] = useState(null);

    const userEmail = user?.email || user?.user?.email;

    useEffect(() => {
        if (userEmail) checkGoogleStatus();
        else setLoading(false);
    }, [userEmail]);

    const checkGoogleStatus = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/auth/google/status?email=${encodeURIComponent(userEmail)}`);
            const data = await res.json();
            setGoogleStatus(data);
        } catch (err) {
            setGoogleStatus({ connected: false });
        } finally {
            setLoading(false);
        }
    };

    const handleConnectGoogle = async () => {
        try {
            setConnecting(true);
            const redirectUri = window.location.origin + '/auth/google/callback';
            const res = await fetch(`${API_BASE_URL}/api/auth/google/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
            const data = await res.json();
            if (data.success && data.url) {
                window.location.href = data.url;
            } else {
                setMessage({ type: 'error', text: 'Failed to get authorization URL. Please try again.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Connection failed: ' + err.message });
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnectGoogle = async () => {
        try {
            setDisconnecting(true);
            const res = await fetch(`${API_BASE_URL}/api/auth/google/disconnect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            });
            const data = await res.json();
            if (data.success) {
                setGoogleStatus({ connected: false });
                setMessage({ type: 'success', text: 'Google Calendar disconnected successfully.' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to disconnect.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Disconnect failed: ' + err.message });
        } finally {
            setDisconnecting(false);
        }
    };

    return (
        <div className="space-y-6">
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.type === 'success' ? <Check className="h-4 w-4 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
                    <span className="text-sm">{message.text}</span>
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1 flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-indigo-500" />
                    Google Calendar
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    Connect your Google Calendar to enable event creation and scheduling features in Slotify.
                </p>

                {loading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Checking connection status...</span>
                    </div>
                ) : googleStatus?.connected ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-green-800">Google Calendar connected</p>
                                {googleStatus.email && (
                                    <p className="text-xs text-green-600">{googleStatus.email}</p>
                                )}
                                {googleStatus.isExpired && (
                                    <p className="text-xs text-amber-600 mt-1">⚠ Token may be expired — reconnect for best performance.</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleConnectGoogle}
                                disabled={connecting}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-indigo-300 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${connecting ? 'animate-spin' : ''}`} />
                                Reconnect
                            </button>
                            <button
                                onClick={handleDisconnectGoogle}
                                disabled={disconnecting}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                <XCircle className="h-4 w-4" />
                                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-800">Google Calendar not connected</p>
                                <p className="text-xs text-amber-600">Connect to create events, sync your schedule, and check availability.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleConnectGoogle}
                            disabled={connecting}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {connecting ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            {connecting ? 'Connecting...' : 'Connect Google Calendar'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const SecuritySettings = ({ user, token }) => {
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [status, setStatus] = useState('idle'); // idle, setup, verifying, success, error
    const [message, setMessage] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);

    const handleSetup = async () => {
        try {
            setStatus('loading');
            const data = await securityService.setup2FA(token);
            setQrCode(data.qrCode);
            setSecret(data.secret);
            setStatus('setup');
        } catch (err) {
            setStatus('error');
            setMessage('Failed to start 2FA setup');
        }
    };

    const handleVerify = async () => {
        try {
            setStatus('loading');
            const data = await securityService.verify2FA(token, verificationCode);
            setBackupCodes(data.backupCodes || []);
            setStatus('success');
            setMessage('2FA Enabled Successfully! specific');
        } catch (err) {
            setStatus('error');
            setMessage('Invalid code. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-indigo-500" />
                    Two-Factor Authentication
                </h3>

                {status === 'idle' && (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Protect your account with an extra layer of security.</p>
                        </div>
                        <button
                            onClick={handleSetup}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Enable 2FA
                        </button>
                    </div>
                )}

                {status === 'setup' && (
                    <div className="mt-4 space-y-4">
                        <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                            <p className="text-sm font-medium text-gray-900 mb-2">1. Scan this QR Code</p>
                            {qrCode && <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 mx-auto" />}
                            <p className="text-xs text-gray-500 mt-2 text-center">Or enter manual key: <code className="bg-gray-100 p-1 rounded">{secret}</code></p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">2. Enter Verification Code</p>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="123456"
                                    className="block w-40 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <button
                                    onClick={handleVerify}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Verify
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="mt-4 bg-green-50 p-4 rounded-md border border-green-200">
                        <div className="flex">
                            <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">2FA Enabled</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>Save these backup codes in a safe place:</p>
                                    <ul className="mt-1 list-disc list-inside font-mono">
                                        {backupCodes.map(code => <li key={code}>{code}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="mt-4 bg-red-50 p-4 rounded-md">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            <p className="ml-3 text-sm text-red-700">{message}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Existing Audit Logs placeholder... */}
        </div>
    );
};

const TeamSettings = () => (
    <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Team Members</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Invite Member
            </button>
        </div>
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new team.</p>
        </div>
    </div>
);

const ComplianceSettings = ({ token }) => {
    const [exportStatus, setExportStatus] = useState('idle');

    const handleExport = async () => {
        try {
            setExportStatus('loading');
            const data = await securityService.exportUserData(token);

            // Create downloadable file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `slotify-data-export-${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setExportStatus('success');
        } catch (error) {
            setExportStatus('error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center">
                    <Download className="mr-2 h-5 w-5 text-indigo-500" />
                    Data Export (GDPR)
                </h3>
                <p className="text-sm text-gray-500 mb-4">Download a copy of all your personal data, including profile info, logs, and history.</p>
                <button
                    onClick={handleExport}
                    disabled={exportStatus === 'loading'}
                    className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                    {exportStatus === 'loading' ? 'Preparing...' : 'Request Data Archive'}
                </button>
                {exportStatus === 'success' && <p className="mt-2 text-sm text-green-600">Export downloaded successfully.</p>}
            </div>

            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-red-500">
                <h3 className="text-lg font-medium leading-6 text-red-600 mb-4 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Danger Zone
                </h3>
                <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
