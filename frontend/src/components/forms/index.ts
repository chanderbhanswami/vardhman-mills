/**
 * Form Components Export Hub
 * 
 * Central export file for all form-related components including form elements,
 * validation, filters, search forms, and newsletter forms.
 */

// ============================================================================
// Filter Form Components
// ============================================================================

export { default as FilterForm } from './FilterForm/FilterForm';

export type { 
  FilterType,
  FilterOption,
  FilterFormProps,
  FilterGroup
} from './FilterForm/FilterForm';

// ============================================================================
// Form Elements
// ============================================================================

export { default as FormError } from './FormElements/FormError';
export { default as FormField } from './FormElements/FormField';
export { default as FormGroup } from './FormElements/FormGroup';
export { default as FormLabel } from './FormElements/FormLabel';
export { default as FormSuccess } from './FormElements/FormSuccess';
export { default as FormValidation } from './FormElements/FormValidation';

export type { FormErrorProps } from './FormElements/FormError';
export type { FormFieldProps } from './FormElements/FormField';
export type { FormGroupProps } from './FormElements/FormGroup';
export type { FormLabelProps } from './FormElements/FormLabel';
export type { FormSuccessProps } from './FormElements/FormSuccess';
export type { 
  ValidationRule,
  ValidationResult,
  FormValidationProps
} from './FormElements/FormValidation';

// ============================================================================
// Newsletter Form Components
// ============================================================================

export { default as NewsletterForm } from './NewsletterForm/NewsletterForm';
export { default as NewsletterPreferences } from './NewsletterForm/NewsletterPreferences';

export type { 
  NewsletterFormProps,
  NewsletterFormData 
} from './NewsletterForm/NewsletterForm';
export type { 
  NewsletterPreferencesProps,
  PreferenceData 
} from './NewsletterForm/NewsletterPreferences';

// ============================================================================
// Search Form Components
// ============================================================================

export { default as AdvancedSearch } from './SearchForm/AdvancedSearch';
export { default as SearchFilters } from './SearchForm/SearchFilters';
export { default as SearchInput } from './SearchForm/SearchInput';

export type { 
  SearchScope,
  SearchOperator,
  SearchSortBy,
  SearchResultType,
  AdvancedSearchProps,
  SearchQuery
} from './SearchForm/AdvancedSearch';
export type { 
  FilterDataType,
  FilterOperatorType,
  SearchFiltersProps
} from './SearchForm/SearchFilters';
export type { 
  SearchScope as SearchInputScope,
  SearchMode,
  SearchSuggestion,
  SearchInputProps
} from './SearchForm/SearchInput';
