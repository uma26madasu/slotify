import React, { useState } from 'react';
import { Shield, Users, FileText, User, Lock, Download, Trash2, Check, AlertTriangle } from 'lucide-react';
import * as securityService from '../services/securityService';

const SettingsPage = ({ user }) => {
    const [activeTab, setActiveTab] = useState('profile');

    // Passing user token down would be ideal, for now assuming we can get it or user prop has it
    const token = user?.accessToken || user?.token;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
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
