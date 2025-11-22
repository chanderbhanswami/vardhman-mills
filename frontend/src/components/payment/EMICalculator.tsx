'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  CalculatorIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Slider } from '@/components/ui/Slider';
import { cn } from '@/lib/utils';
import type { EMIOption } from '@/types/payment.types';
import type { Price } from '@/types/common.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EMICalculatorProps {
  /**
   * Total order amount
   */
  orderAmount: Price;

  /**
   * Available EMI options
   */
  emiOptions: EMIOption[];

  /**
   * Currently selected EMI option
   */
  selectedOptionId?: string;

  /**
   * Callback when EMI option is selected
   */
  onSelect: (emiOption: EMIOption) => void;

  /**
   * Callback for EMI application
   */
  onApply?: (emiOption: EMIOption) => void;

  /**
   * Show interest calculation breakdown
   */
  showBreakdown?: boolean;

  /**
   * Enable tenor (duration) customization
   */
  allowTenorCustomization?: boolean;

  /**
   * Display variant
   * - default: Full calculator with all options
   * - compact: Minimal calculator
   * - comparison: Side-by-side comparison
   */
  variant?: 'default' | 'compact' | 'comparison';

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * EMI Calculation Result
 */
interface EMICalculation {
  emiAmount: number;
  totalAmount: number;
  totalInterest: number;
  processingFee: number;
  savings: number;
  monthlyBreakdown: MonthlyBreakdown[];
}

interface MonthlyBreakdown {
  month: number;
  emiAmount: number;
  principal: number;
  interest: number;
  balance: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format currency amount
 */
const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate EMI using reducing balance method
 */
const calculateEMI = (
  principal: number,
  annualRate: number,
  tenorMonths: number
): number => {
  if (annualRate === 0) {
    return principal / tenorMonths;
  }

  const monthlyRate = annualRate / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenorMonths)) /
    (Math.pow(1 + monthlyRate, tenorMonths) - 1);

  return Math.round(emi);
};

/**
 * Calculate detailed EMI breakdown
 */
const calculateEMIBreakdown = (
  principal: number,
  annualRate: number,
  tenorMonths: number,
  processingFee: number
): EMICalculation => {
  const emiAmount = calculateEMI(principal, annualRate, tenorMonths);
  const totalAmount = emiAmount * tenorMonths + processingFee;
  const totalInterest = totalAmount - principal - processingFee;

  const monthlyBreakdown: MonthlyBreakdown[] = [];
  let balance = principal;
  const monthlyRate = annualRate / 12 / 100;

  for (let month = 1; month <= tenorMonths; month++) {
    const interest = Math.round(balance * monthlyRate);
    const principalPaid = emiAmount - interest;
    balance -= principalPaid;

    monthlyBreakdown.push({
      month,
      emiAmount,
      principal: principalPaid,
      interest,
      balance: Math.max(0, balance),
    });
  }

  return {
    emiAmount,
    totalAmount,
    totalInterest,
    processingFee,
    savings: 0, // Can be calculated based on cash payment discount
    monthlyBreakdown,
  };
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * EMI Option Card Component
 */
interface EMIOptionCardProps {
  option: EMIOption;
  orderAmount: number;
  selected: boolean;
  onSelect: () => void;
  showBreakdown: boolean;
  variant: 'default' | 'compact' | 'comparison';
}

const EMIOptionCard: React.FC<EMIOptionCardProps> = ({
  option,
  orderAmount,
  selected,
  onSelect,
  showBreakdown,
  variant,
}) => {
  const [expanded, setExpanded] = useState(false);

  const calculation = useMemo(
    () =>
      calculateEMIBreakdown(
        orderAmount,
        option.interestRate,
        option.duration,
        option.processingFee.amount
      ),
    [orderAmount, option]
  );

  const isEligible = orderAmount >= option.minimumAmount.amount;

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all',
          selected
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300',
          !isEligible && 'opacity-50 cursor-not-allowed'
        )}
        onClick={isEligible ? onSelect : undefined}
      >
        <div className="flex items-center gap-3">
          <CreditCardIcon className="h-6 w-6 text-primary-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {option.duration} Months
            </p>
            <p className="text-xs text-gray-500">{option.interestRate}% interest</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(calculation.emiAmount)}/mo
          </p>
          {selected && <CheckCircleIcon className="h-5 w-5 text-primary-600 ml-auto mt-1" />}
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        selected ? 'ring-2 ring-primary-500' : 'hover:shadow-md',
        !isEligible && 'opacity-50 cursor-not-allowed'
      )}
      onClick={isEligible ? onSelect : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                selected ? 'bg-primary-100' : 'bg-gray-100'
              )}
            >
              <CreditCardIcon
                className={cn(
                  'h-5 w-5',
                  selected ? 'text-primary-600' : 'text-gray-600'
                )}
              />
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-900">
                {option.duration} Months EMI
              </h4>
              <p className="text-sm text-gray-500">{option.provider}</p>
            </div>
          </div>
          {selected && <CheckCircleIcon className="h-6 w-6 text-primary-600" />}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* EMI Amount Display */}
        <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Monthly EMI</p>
          <p className="text-3xl font-bold text-primary-600">
            {formatCurrency(calculation.emiAmount)}
          </p>
          <p className="text-xs text-gray-500 mt-1">for {option.duration} months</p>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Interest Rate</p>
            <p className="text-lg font-semibold text-gray-900">
              {option.interestRate}%
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Processing Fee</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(option.processingFee.amount)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Total Interest</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(calculation.totalInterest)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Total Amount</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(calculation.totalAmount)}
            </p>
          </div>
        </div>

        {/* Eligibility Badge */}
        <div className="flex items-center gap-2">
          {isEligible ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3" />
              Eligible
            </Badge>
          ) : (
            <Badge variant="destructive">
              Min. amount {formatCurrency(option.minimumAmount.amount)}
            </Badge>
          )}
          {option.interestRate === 0 && (
            <Badge variant="info">No Cost EMI</Badge>
          )}
        </div>

        {/* Expandable Breakdown */}
        {showBreakdown && isEligible && (
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="flex items-center justify-between w-full py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <span>View Monthly Breakdown</span>
              {expanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 max-h-64 overflow-y-auto border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">
                            Month
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">
                            EMI
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">
                            Principal
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">
                            Interest
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {calculation.monthlyBreakdown.map((row) => (
                          <tr key={row.month} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-900">{row.month}</td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              {formatCurrency(row.emiAmount)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-600">
                              {formatCurrency(row.principal)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-600">
                              {formatCurrency(row.interest)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-600">
                              {formatCurrency(row.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Terms Link */}
        {option.terms && (
          <p className="text-xs text-gray-500">
            <a href="#" className="text-primary-600 hover:underline">
              View terms and conditions
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * EMICalculator Component
 * 
 * Comprehensive EMI (Equated Monthly Installment) calculator with multiple options.
 * Features:
 * - Multiple EMI options display
 * - Real-time EMI calculation
 * - Interest breakdown
 * - Monthly payment schedule
 * - Eligibility checking
 * - No-cost EMI indication
 * - Comparison view
 * - Animated transitions
 * 
 * @example
 * ```tsx
 * <EMICalculator
 *   orderAmount={{ amount: 50000, currency: 'INR' }}
 *   emiOptions={availableEMIOptions}
 *   onSelect={(option) => handleEMISelect(option)}
 *   showBreakdown
 * />
 * ```
 */
export const EMICalculator: React.FC<EMICalculatorProps> = ({
  orderAmount,
  emiOptions,
  selectedOptionId,
  onSelect,
  onApply,
  showBreakdown = true,
  allowTenorCustomization = false,
  variant = 'default',
  animated = true,
  className,
}) => {
  const [customTenor, setCustomTenor] = useState<number>(12);

  // Filter available EMI options based on order amount
  const availableOptions = useMemo(() => {
    return emiOptions
      .filter(
        (option) =>
          option.isAvailable &&
          orderAmount.amount >= option.minimumAmount.amount &&
          orderAmount.amount <= option.maximumAmount.amount
      )
      .sort((a, b) => a.duration - b.duration);
  }, [emiOptions, orderAmount]);

  const selectedOption = useMemo(() => {
    return availableOptions.find((opt) => opt.id === selectedOptionId);
  }, [availableOptions, selectedOptionId]);

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  // Grid layout classes
  const gridClasses = {
    default: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    compact: 'space-y-3',
    comparison: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4',
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalculatorIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">EMI Calculator</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Choose a convenient EMI plan for your purchase
          </p>
        </div>
        {selectedOption && onApply && (
          <Button
            variant="default"
            onClick={() => onApply(selectedOption)}
            leftIcon={<CreditCardIcon className="h-4 w-4" />}
          >
            Apply for EMI
          </Button>
        )}
      </div>

      {/* Order Amount Display */}
      <Card className="bg-gradient-to-r from-primary-50 to-blue-50">
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-2">Order Amount</p>
          <p className="text-4xl font-bold text-gray-900">
            {formatCurrency(orderAmount.amount, orderAmount.currency)}
          </p>
          {availableOptions.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {availableOptions.length} EMI option{availableOptions.length > 1 ? 's' : ''}{' '}
              available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Custom Tenor Selector (if enabled) */}
      {allowTenorCustomization && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900">
                Customize Tenor (Months)
              </label>
              <span className="text-2xl font-bold text-primary-600">{customTenor}</span>
            </div>
            <Slider
              value={[customTenor]}
              onValueChange={(values) => setCustomTenor(values[0])}
              min={3}
              max={60}
              step={3}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>3 months</span>
              <span>60 months</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* EMI Options */}
      {availableOptions.length > 0 ? (
        <AnimatePresence mode="wait">
          {animated ? (
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className={gridClasses[variant]}
            >
              {availableOptions.map((option) => (
                <motion.div key={option.id} variants={itemVariants}>
                  <EMIOptionCard
                    option={option}
                    orderAmount={orderAmount.amount}
                    selected={option.id === selectedOptionId}
                    onSelect={() => onSelect(option)}
                    showBreakdown={showBreakdown}
                    variant={variant}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className={gridClasses[variant]}>
              {availableOptions.map((option) => (
                <EMIOptionCard
                  key={option.id}
                  option={option}
                  orderAmount={orderAmount.amount}
                  selected={option.id === selectedOptionId}
                  onSelect={() => onSelect(option)}
                  showBreakdown={showBreakdown}
                  variant={variant}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      ) : (
        <Card className="p-8">
          <div className="text-center">
            <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              No EMI Options Available
            </h4>
            <p className="text-sm text-gray-500">
              EMI is not available for this order amount.
              {emiOptions.length > 0 && emiOptions[0].minimumAmount && (
                <span className="block mt-1">
                  Minimum order value:{' '}
                  {formatCurrency(emiOptions[0].minimumAmount.amount)}
                </span>
              )}
            </p>
          </div>
        </Card>
      )}

      {/* Information Notice */}
      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium">About EMI</p>
          <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
            <li>No pre-payment charges apply</li>
            <li>EMI approval subject to credit check</li>
            <li>Processing fee is non-refundable</li>
            <li>Interest rate may vary based on credit score</li>
            <li>Additional documentation may be required</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;
