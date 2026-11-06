import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCard } from '../components/PostCard';
import { SocialPost } from '../types';

describe('PostCard Component', () => {
  const mockPost: SocialPost = {
    id: 'post-1',
    authorId: 'user-1',
    authorName: 'Mariana Duarte',
    content: 'Muito contente com o reconhecimento do projeto!',
    imageUrl: 'https://img.com/celebration.png',
    likesCount: 14,
    createdAt: new Date().toISOString(),
  };

  it('renders author, content and like count', () => {
    render(<PostCard post={mockPost} onLike={vi.fn()} />);

    expect(screen.getByText('Mariana Duarte')).toBeInTheDocument();
    expect(screen.getByText(/muito contente com o reconhecimento/i)).toBeInTheDocument();
    expect(screen.getByText('14 curtidas')).toBeInTheDocument();
  });

  it('invokes onLike callback when like button is clicked', async () => {
    const user = userEvent.setup();
    const handleLike = vi.fn();

    render(<PostCard post={mockPost} onLike={handleLike} />);
    const likeButton = screen.getByRole('button', { name: /curtir/i });
    await user.click(likeButton);

    expect(handleLike).toHaveBeenCalledWith('post-1');
  });
});
