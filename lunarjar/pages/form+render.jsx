import { useState } from 'react';
import WishForm from '../components/wish-form/wish-form.jsx';
import WishRender from '../components/wish-render/wish-render.jsx';

function FormRender() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleWishSubmitted = () => {
    console.log('🔄 Refreshing wishes...');
    setRefreshKey(prev => {
      console.log('Old key:', prev, 'New key:', prev + 1);
      return prev + 1;
    });
  };
  
  return (
    <div className="form-render-page">
      <WishForm onSubmitSuccess={handleWishSubmitted} />
      <WishRender refreshTrigger={refreshKey} />
    </div>
  );
}

export default FormRender;