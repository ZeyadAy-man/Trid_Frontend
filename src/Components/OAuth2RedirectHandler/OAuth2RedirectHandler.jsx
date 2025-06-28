import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';

function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error) {
      // Handle error case - redirect to unauthorized or show error
      console.error('OAuth2 Error:', error);
      navigate('/unauthorized', { 
        state: { 
          error: error,
          message: 'Authentication failed. Please try again.' 
        }
      });
    } else if (token && email && name && provider) {
      // Handle success case
      try {
        // Log the user in with the OAuth data
        login({
          email: email,
          fullName: name,
          accessToken: token,
          provider: provider,
          // You might need to adjust these based on your auth context structure
          roles: [], // Default roles, adjust as needed
          refreshToken: null // OAuth might not provide refresh token
        });

        // Redirect to dashboard or home page after successful login
        navigate('/home'); // or wherever you want to redirect after login
      } catch (err) {
        console.error('Login processing error:', err);
        navigate('/unauthorized', { 
          state: { 
            error: 'login_processing_failed',
            message: 'Failed to process login. Please try again.' 
          }
        });
      }
    } else {
      // Missing required parameters
      console.error('Missing required OAuth parameters');
      navigate('/unauthorized', { 
        state: { 
          error: 'missing_parameters',
          message: 'Invalid authentication response. Please try again.' 
        }
      });
    }
  }, [searchParams, login, navigate]);

  // Show loading spinner while processing
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 2s linear infinite'
      }}></div>
      <p style={{ marginTop: '20px', color: '#666' }}>
        Processing authentication...
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default OAuth2RedirectHandler;