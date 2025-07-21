import React from 'react';
import AssetForm from '../AssetForm';

const BasicInfoTab = ({ assetId }) => {
  return (
    <div>
      <AssetForm assetId={assetId} />
    </div>
  );
};

export default BasicInfoTab;
