import React from 'react';
import AssetForm from '../assetMain/AssetForm';

const BasicInfoTab = ({ assetId }) => {
  return (
    <div>
      <AssetForm assetId={assetId} />
    </div>
  );
};

export default BasicInfoTab;
