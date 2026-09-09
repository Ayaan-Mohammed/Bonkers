import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-nlip-wrap mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-nlip-surface-hi border border-nlip-border flex items-center justify-center text-nlip-amber">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold font-display text-nlip-text mb-2">
        404 · Page Not Found
      </h1>
      <p className="text-sm text-nlip-text-soft mb-6 max-w-md mx-auto">
        The page or resource you requested could not be located in the NLIP portal.
      </p>
      <Link to="/">
        <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Home
        </Button>
      </Link>
    </div>
  );
};
