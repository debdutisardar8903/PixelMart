'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BottomNav from '@/components/bottomnav/BottomNav';
import { useAuth } from '@/components/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, push, onValue, serverTimestamp, update } from 'firebase/database';

export default function HelpCenterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('open');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: ''
  });

  const categories = [
    'Account Issues',
    'Payment Problems',
    'Download Issues',
    'Product Quality',
    'Technical Support',
    'Refund Request',
    'License Questions',
    'Other'
  ];

  // Load user tickets
  useEffect(() => {
    if (!user?.uid) return;

    const ticketsRef = ref(database, `supportTickets/${user.uid}`);
    const unsubscribe = onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ticketsList = Object.entries(data).map(([id, ticket]) => ({
          id,
          ...ticket
        })).sort((a, b) => {
          // Handle both timestamp objects and numbers for sorting
          const timeA = typeof a.createdAt === 'object' ? Date.now() : a.createdAt;
          const timeB = typeof b.createdAt === 'object' ? Date.now() : b.createdAt;
          return timeB - timeA;
        });
        setTickets(ticketsList);
        console.log('Support tickets loaded:', ticketsList);
      } else {
        setTickets([]);
        console.log('No support tickets found for user');
      }
    }, (error) => {
      console.error('Error loading support tickets:', error);
      setTickets([]);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!user?.uid || !formData.subject || !formData.category || !formData.message) return;

    setLoading(true);
    try {
      const ticketsRef = ref(database, `supportTickets/${user.uid}`);
      const newTicket = {
        subject: formData.subject,
        category: formData.category,
        status: 'open',
        priority: 'medium',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messages: {
          [Date.now()]: {
            message: formData.message,
            sender: 'user',
            senderName: user.displayName || user.email,
            timestamp: serverTimestamp()
          }
        }
      };

      await push(ticketsRef, newTicket);
      
      setFormData({ subject: '', category: '', message: '' });
      setShowCreateForm(false);
      setActiveTab('open');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    setLoading(true);
    try {
      const messageRef = ref(database, `supportTickets/${user.uid}/${selectedTicket.id}/messages`);
      await push(messageRef, {
        message: newMessage,
        sender: 'user',
        senderName: user.displayName || user.email,
        timestamp: serverTimestamp()
      });

      // Update ticket's updatedAt timestamp
      const ticketRef = ref(database, `supportTickets/${user.uid}/${selectedTicket.id}`);
      await update(ticketRef, {
        updatedAt: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => ticket.status === activeTab);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedTicket) {
    return (
      <div className="font-sans min-h-screen bg-white flex flex-col">
        <div className="hidden sm:block">
          <Header />
        </div>
        
        <div className="flex-1 pt-6 sm:pt-24 px-4">
          <div className="mx-auto max-w-4xl">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Support Tickets
              </button>
            </div>

            {/* Ticket Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedTicket.subject}</h1>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {selectedTicket.category}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                  Created: {typeof selectedTicket.createdAt === 'number' ? new Date(selectedTicket.createdAt).toLocaleDateString() : 'Just now'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedTicket.messages && Object.entries(selectedTicket.messages)
                  .sort(([a, messageA], [b, messageB]) => {
                    // Sort by timestamp if available, otherwise by message ID
                    const timeA = typeof messageA.timestamp === 'object' ? parseInt(a) : messageA.timestamp || parseInt(a);
                    const timeB = typeof messageB.timestamp === 'object' ? parseInt(b) : messageB.timestamp || parseInt(b);
                    return timeA - timeB;
                  })
                  .map(([id, message]) => (
                    <div key={id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="text-sm font-medium mb-1">
                          {message.sender === 'user' ? 'You' : 'Support Team'}
                        </div>
                        <div className="text-sm">{message.message}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {message.timestamp && typeof message.timestamp === 'number' && new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Reply Form */}
            {selectedTicket.status === 'open' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Reply</h3>
                <form onSubmit={handleSendMessage}>
                  <div className="mb-4">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16">
          <Footer />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      <div className="hidden sm:block">
        <Header />
      </div>
      
      <div className="flex-1 pt-6 sm:pt-24 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Back Button */}
          <div className="mb-4 sm:hidden">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center justify-center w-12 h-12 bg-gray-50 border-2 border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Desktop Back Button */}
          <div className="hidden sm:block mb-6">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </Link>
          </div>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">🎧 Help Center</h1>
            <p className="text-gray-600">Manage your support tickets and get help from our team</p>
          </div>

          {/* Tabs and Create Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4 sm:mb-0">
              <button
                onClick={() => setActiveTab('open')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'open'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Open ({tickets.filter(t => t.status === 'open').length})
              </button>
              <button
                onClick={() => setActiveTab('closed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'closed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Closed ({tickets.filter(t => t.status === 'closed').length})
              </button>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Ticket
            </button>
          </div>

          {/* Create Ticket Form */}
          {showCreateForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Create New Support Ticket</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your issue in detail..."
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? 'Creating...' : 'Submit Ticket'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tickets List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} tickets</h3>
                <p className="text-gray-500">
                  {activeTab === 'open' 
                    ? "You don't have any open support tickets." 
                    : "You don't have any closed support tickets."
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{ticket.subject}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {ticket.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Created: {typeof ticket.createdAt === 'number' ? new Date(ticket.createdAt).toLocaleDateString() : 'Just now'} • 
                          Updated: {typeof ticket.updatedAt === 'number' ? new Date(ticket.updatedAt).toLocaleDateString() : 'Just now'}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
