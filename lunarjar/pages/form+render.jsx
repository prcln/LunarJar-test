import { useState } from 'react';
import { useParams } from 'react-router-dom';

import WishForm from '../components/wish-form/wish-form.jsx';
import WishRender from '../components/wish-render/wish-render.jsx';

function FormRender() {
  const { tree: treeId } = useParams();
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
      <WishRender currentTreeId={treeId} refreshTrigger={refreshKey}/>
      <WishForm currentTreeId={treeId}onSubmitSuccess={handleWishSubmitted} />
    </div>
  );
}

export default FormRender;