import { render, screen } from '@/test/utils/test-utils';
import Index from '@/pages/Index';

describe('Index Component', () => {
  it('renders the main heading', () => {
    render(<Index />);
    
    expect(screen.getByRole('heading', { 
      name: /welcome to mymeds pharmacy/i 
    })).toBeInTheDocument();
  });

  it('renders the hero section', () => {
    render(<Index />);
    
    expect(screen.getByText(/your health, our priority/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Index />);
    
    expect(screen.getByRole('link', { name: /shop/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    render(<Index />);
    
    expect(screen.getByRole('button', { name: /shop now/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument();
  });

  it('displays pharmacy information', () => {
    render(<Index />);
    
    expect(screen.getByText(/licensed pharmacy/i)).toBeInTheDocument();
    expect(screen.getByText(/professional staff/i)).toBeInTheDocument();
  });
});




