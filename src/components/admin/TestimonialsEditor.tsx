
import React from 'react';
import TestimonialForm from './testimonials/TestimonialForm';
import TestimonialCard from './testimonials/TestimonialCard';
import { useTestimonials } from '@/hooks/useTestimonials';

const TestimonialsEditor = () => {
  const {
    testimonials,
    loading,
    editingItem,
    author,
    role,
    content,
    avatarFile,
    setAuthor,
    setRole,
    setContent,
    setAvatarFile,
    resetForm,
    handleEdit,
    handleDelete,
    handleSubmit
  } = useTestimonials();

  return (
    <div className="space-y-8">
      {/* Form */}
      <TestimonialForm
        author={author}
        setAuthor={setAuthor}
        role={role}
        setRole={setRole}
        content={content}
        setContent={setContent}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        editingItem={editingItem}
        loading={loading}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
      />
      
      {/* Testimonials list */}
      <div className="space-y-4">
        {testimonials.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            <p>No testimonials added yet.</p>
          </div>
        ) : (
          testimonials.map((item) => (
            <TestimonialCard 
              key={item.id} 
              item={item} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TestimonialsEditor;
