// Work type rates
const WORK_RATE = {
  FULL_DAY: 400,
  HALF_DAY: 200,
  EXTRA_HOUR: 50,
};

// Work types enum
const WORK_TYPES = {
  FULL_DAY: 'FULL_DAY',
  HALF_DAY: 'HALF_DAY',
};

// Crop types (common examples)
const CROP_TYPES = [
  'Ornamental Plants',
  'Fruit Plants',
  'Vegetable Seedlings',
  'Flower Plants',
  'Medicinal Plants',
  'Shade Plants',
  'Seasonal Plants',
];

// Raw material categories
const RAW_MATERIAL_TYPES = [
  'Soil',
  'Seeds',
  'Fertilizers',
  'Pots',
  'Pesticides',
  'Tools',
  'Other',
];

// Invoice status
const INVOICE_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
};

module.exports = {
  WORK_RATE,
  WORK_TYPES,
  CROP_TYPES,
  RAW_MATERIAL_TYPES,
  INVOICE_STATUS,
};
