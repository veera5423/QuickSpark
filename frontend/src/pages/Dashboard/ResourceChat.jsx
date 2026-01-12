import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Chatbox from '../../components/ui/Chatbox'; 
import axiosClient from '../../api/axiosClient';

const ResourceChat = () => {
    const { resourceId } = useParams(); // Gets the ID from the URL (can be MongoID or UUID)
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const id=resourceId;
    console.log(id);
    
    

    useEffect(() => {
        // In ResourceChat.jsx

const fetchResource = async () => {
    try {
        setLoading(true);
        // Ensure that the URL parameter 'id' is defined
        if (!id) {
            setError("Missing resource identifier in URL.");
            return;
        }

        // Fetch all resources
        const response = await axiosClient.get('/api/resources/');
        const resources = response.data.resources || [];
        console.log(resource);
        console.log("id=",id);
        
        
        // 🚀 CRITICAL FIX: The ID in the URL (id) could be EITHER the Mongo _id OR the UUID.
        // We look for a match in EITHER field.
        const found = resources.find(r => 
            // Check if the Mongo _id matches the URL ID
            String(r._id )=== id || 
            // Check if the Postgres UUID matches the URL ID
           String( r.resource_uuid) === id
        );
        
        if (found) {
            setResource(found);
        } else {
            // This case handles old resources that might be missing the UUID field entirely.
            setError("Resource not found or database fields are inconsistent.");
        }
    } catch (err) {
        console.error("Error loading resource", err);
        setError("Failed to load study session.");
    } finally {
        setLoading(false);
    }
};


        fetchResource();
    }, [id, navigate]); // Added navigate to dependency array

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <div className="animate-pulse text-indigo-600 font-medium">Loading study session...</div>
            </div>
        );
    }

    if (error || !resource) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Resource Not Found</h3>
                <p className="text-gray-500 mb-6">We couldn't find the document you are looking for.</p>
                <Button onClick={() => navigate('/dashboard/resources')} className="bg-indigo-600 text-white">
                    Back to Library
                </Button>
            </div>
        );
    }

    // Determine the ID to send to the backend chat endpoint
    // It MUST be the UUID for Postgres, falling back to Mongo ID if UUID field is missing (last resort)
    const chatResourceId = resource.resource_uuid || resource._id;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 p-4">
            
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <Button 
                        onClick={() => navigate('/dashboard/resources')} 
                        className="bg-gray-400 text-gray-600 hover:bg-gray-500 px-3 py-1 text-sm rounded-lg"
                    >
                        ← Back
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 truncate max-w-md">
                            {resource.original_filename || resource.filename}
                        </h1>
                        <p className="text-xs text-gray-500">
                            {resource.metadata?.page_count || '?'} Pages • {(resource.metadata?.file_size_kb || 0).toFixed(0)} KB
                        </p>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                     {resource.linked_modules?.mock_test_id && (
                        <Button 
                            onClick={() => navigate(`/dashboard/mock-tests?resource=${resource._id}`)}
                            className="bg-green-500 text-green-700 hover:bg-green-700 border border-green-200 text-sm cursor-pointer px-3 py-1 rounded-lg"
                        >
                            📝 Take Quiz
                        </Button>
                     )}
                </div>
            </div>

            {/* --- SPLIT SCREEN CONTENT --- */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                
                {/* LEFT PANEL: AI SUMMARIZER */}
                <Card className="w-1/2 flex flex-col overflow-hidden h-full p-0 border-0 shadow-md">
                    <div className="p-4 border-b bg-indigo-50 flex justify-between items-center">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                            <span>📄</span> AI Summary
                        </h3>
                        <span className="text-xs bg-white text-indigo-600 px-2 py-1 rounded-full border border-indigo-100">
                            {resource.status === 'summarized' ? 'Ready' : 'Processing'}
                        </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-white">
                        {resource.summary ? (
                            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {resource.summary}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <div className="animate-spin h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-4"></div>
                                <p>Generating Summary...</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* RIGHT PANEL: CHATBOX CONTAINER */}
                <div className="w-1/2 h-full">
                    {/* This is where your Chatbox component will live */}
                    <Chatbox 
                        resourceId={chatResourceId} // ◀️ CORRECT ID PASSED HERE
                        onClose={() => navigate('/dashboard/resources')}
                    />
                </div>

            </div>
        </div>
    );
};

export default ResourceChat;