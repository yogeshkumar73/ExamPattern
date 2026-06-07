# Community Repository - Frontend Integration Guide

## Quick Start

This guide helps you create the UI components to interact with the Community Repository backend API.

## Required Components

### 1. Upload Paper Form Component

```typescript
// components/community/upload-paper-form.tsx
'use client';

import { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

export function UploadPaperForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file || !title || !examType || !subject || !year) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('examType', examType);
      formData.append('subject', subject);
      formData.append('year', year);
      formData.append('description', description);
      
      const user = JSON.parse(localStorage.getItem('aura_session') || '{}');
      formData.append('userId', user._id);

      const response = await fetch('/api/papers/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      setSuccess(`Paper "${data.paper.title}" uploaded successfully!`);
      // Reset form
      setFile(null);
      setTitle('');
      setExamType('');
      setSubject('');
      setYear('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 p-6 bg-slate-950 rounded-lg border border-slate-800">
      <h2 className="text-2xl font-bold text-white mb-6">Upload Paper</h2>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-950 border border-red-800 rounded-lg text-red-200">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-950 border border-green-800 rounded-lg text-green-200">
          {success}
        </div>
      )}

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Paper File *
        </label>
        <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-500 transition">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="file-input"
            accept=".pdf,.docx,.pptx,.zip,.jpg,.jpeg,.png,.gif,.webp"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <Upload className="mx-auto mb-2 text-slate-400" size={32} />
            <p className="text-gray-400">
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOCX, PPTX, ZIP, Images (Max 50MB)
            </p>
          </label>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Paper title"
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Exam Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Exam Type *
        </label>
        <select
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Select exam type</option>
          <option value="JEE">JEE</option>
          <option value="NEET">NEET</option>
          <option value="UPSC">UPSC</option>
          <option value="GATE">GATE</option>
          <option value="SSC">SSC</option>
          <option value="CBSE">CBSE</option>
          <option value="Board">Board</option>
          <option value="University">University</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Subject *
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Physics, Chemistry, Mathematics"
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Year */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Year *
        </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="e.g., 2023"
          min="1990"
          max={new Date().getFullYear()}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={4}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
      >
        {loading ? 'Uploading...' : 'Upload Paper'}
      </button>
    </form>
  );
}
```

### 2. Paper Card Component

```typescript
// components/community/paper-card.tsx
'use client';

import { Download, Heart, Bookmark, Flag, Share2 } from 'lucide-react';
import { useState } from 'react';

interface PaperCardProps {
  paperId: string;
  title: string;
  subject: string;
  examType: string;
  year: number;
  uploaderName: string;
  downloads: number;
  likes: number;
  bookmarks?: number;
  userId?: string;
}

export function PaperCard({
  paperId,
  title,
  subject,
  examType,
  year,
  uploaderName,
  downloads,
  likes,
  userId,
}: PaperCardProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleDownload = async () => {
    if (!userId) {
      alert('Please log in to download');
      return;
    }

    window.location.href = `/api/papers/download?paperId=${paperId}&userId=${userId}`;
  };

  const handleLike = async () => {
    if (!userId) {
      alert('Please log in');
      return;
    }

    try {
      const method = liked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/papers/${paperId}/like`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setLiked(!liked);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleBookmark = async () => {
    if (!userId) {
      alert('Please log in');
      return;
    }

    try {
      const method = bookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/papers/${paperId}/bookmark`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setBookmarked(!bookmarked);
      }
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
        <div className="flex gap-2 mt-2 text-xs">
          <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded">
            {examType}
          </span>
          <span className="px-2 py-1 bg-slate-800 text-gray-300 rounded">
            {year}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="text-sm text-gray-400 mb-4">
        <p>{subject}</p>
        <p className="text-xs text-gray-500 mt-1">by {uploaderName}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-400 mb-4 border-y border-slate-800 py-3">
        <div className="flex items-center gap-1">
          <Download size={16} />
          <span>{downloads}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart size={16} />
          <span>{likes}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition flex items-center justify-center gap-2"
        >
          <Download size={16} />
          Download
        </button>
        <button
          onClick={handleLike}
          className={`px-3 py-2 border rounded transition ${
            liked
              ? 'bg-red-900 border-red-700 text-red-200'
              : 'border-slate-700 text-gray-400 hover:border-slate-600'
          }`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={handleBookmark}
          className={`px-3 py-2 border rounded transition ${
            bookmarked
              ? 'bg-yellow-900 border-yellow-700 text-yellow-200'
              : 'border-slate-700 text-gray-400 hover:border-slate-600'
          }`}
        >
          <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
        <button className="px-3 py-2 border border-slate-700 text-gray-400 hover:border-slate-600 rounded transition">
          <Flag size={16} />
        </button>
      </div>
    </div>
  );
}
```

### 3. Search Papers Component

```typescript
// components/community/search-papers.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { PaperCard } from './paper-card';

export function SearchPapers() {
  const [query, setQuery] = useState('');
  const [examType, setExamType] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<any>(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        examType,
        subject,
        year,
        sort,
        page: page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/papers/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setPapers(data.data.papers);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [page, sort]);

  const user = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('aura_session') || '{}')
    : null;

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search papers..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={examType}
            onChange={(e) => {
              setExamType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Exams</option>
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="UPSC">UPSC</option>
            <option value="GATE">GATE</option>
          </select>

          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setPage(1);
            }}
            placeholder="Subject"
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />

          <input
            type="number"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            placeholder="Year"
            min="1990"
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Downloaded</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : papers.length === 0 ? (
        <div className="text-center text-gray-400">No papers found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {papers.map((paper) => (
              <PaperCard
                key={paper._id}
                paperId={paper._id}
                title={paper.title}
                subject={paper.subject}
                examType={paper.examType}
                year={paper.year}
                uploaderName={paper.uploaderName}
                downloads={paper.downloads}
                likes={paper.likes}
                userId={user?._id}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-white rounded-lg hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-white rounded-lg hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

## Integration into Pages

### Community Page

```typescript
// app/community/page.tsx
import { SearchPapers } from '@/components/community/search-papers';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Community Papers</h1>
        <p className="text-gray-400 mb-8">Browse, download, and share academic papers</p>
        <SearchPapers />
      </div>
    </div>
  );
}
```

### Upload Page

```typescript
// app/upload/page.tsx
import { UploadPaperForm } from '@/components/community/upload-paper-form';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Share Your Papers</h1>
        <p className="text-gray-400 mb-8">Upload papers and help your community</p>
        <UploadPaperForm />
      </div>
    </div>
  );
}
```

## Testing the API

Use curl to test endpoints:

```bash
# Search papers
curl "http://localhost:3000/api/papers/search?q=physics&examType=JEE&sort=popular&page=1"

# Get dashboard
curl "http://localhost:3000/api/papers/dashboard"

# Check upload quota
curl "http://localhost:3000/api/papers/upload?userId=USER_ID"
```

All backend infrastructure is ready! Start building the UI components with these templates.
