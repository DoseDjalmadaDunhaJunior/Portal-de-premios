import React from 'react';
import { SocialPost } from '../types';
import { Heart, MessageSquare, Share2, Sparkles } from 'lucide-react';

interface PostCardProps {
  post: SocialPost;
  onLike: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  return (
    <div className="glass-card" style={{
      borderRadius: '18px',
      padding: '22px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '18px',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
        }}>
          {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '15px' }}>{post.authorName}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            {new Date(post.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: post.imageUrl ? '18px' : '16px' }}>
        {post.content}
      </div>

      {post.imageUrl && (
        <div style={{
          borderRadius: '14px',
          overflow: 'hidden',
          marginBottom: '16px',
          maxHeight: '380px',
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <img
            src={post.imageUrl}
            alt="Anexo da postagem"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '14px',
      }}>
        <button
          onClick={() => onLike(post.id)}
          aria-label="Curtir"
          style={{
            background: post.likesCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
            border: post.likesCount > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: post.likesCount > 0 ? '#f87171' : '#94a3b8',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
        >
          <Heart size={16} fill={post.likesCount > 0 ? '#ef4444' : 'none'} color={post.likesCount > 0 ? '#ef4444' : '#94a3b8'} />
          <span>{post.likesCount} {post.likesCount === 1 ? 'curtida' : 'curtidas'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>
          <MessageSquare size={16} />
          <span>Comentar</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>
          <Share2 size={16} />
          <span>Compartilhar</span>
        </div>
      </div>
    </div>
  );
};
