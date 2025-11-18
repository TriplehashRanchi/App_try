/**
 * Calculates the final maturity value of a Recurring Deposit based on the
 * simple interest on the total invested amount over the term.
 * 
 * @param {number} monthlyInstallment - The amount paid each month.
 * @param {number} annualRate - The annual interest rate as a percentage (e.g., 24).
 * @param {number} termInMonths - The total number of installments.
 * @returns {object} { totalInvested, maturityValue, totalGain }
 */
export function calculateRdMaturity(monthlyInstallment, annualRate, termInMonths) {
    if (!monthlyInstallment || !annualRate || !termInMonths) {
        return { totalInvested: 0, maturityValue: 0, totalGain: 0 };
    }

    const P = monthlyInstallment;
    const n = termInMonths;
    const R_decimal = annualRate / 100;
    
    const totalInvested = P * n;
    const termInYears = termInMonths / 12;
    const totalGain = totalInvested * R_decimal * termInYears;
    const maturityValue = totalInvested + totalGain;

    return { totalInvested, maturityValue, totalGain };
}

/**
 * Generates data for a dual-line chart showing Principal Invested vs. Current Value for an RD.
 * 
 * @param {number} monthlyInstallment - The amount paid each month.
 * @param {number} annualRate - The annual interest rate as a percentage.
 * @param {number} termInMonths - The total number of installments.
 * @returns {Array} Data for the chart, e.g., [{ name: 'Month 1', invested: 500, value: 510 }, ...]
 */
export function generateRdGrowthChartData(monthlyInstallment, annualRate, termInMonths) {
    if (!monthlyInstallment || !annualRate || !termInMonths) return [];
    
    const chartData = [];
    const R_decimal = annualRate / 100;

    for (let i = 1; i <= termInMonths; i++) {
        const principalInvested = monthlyInstallment * i;
        const termInYears = i / 12;
        const interestEarned = principalInvested * R_decimal * termInYears;
        const currentValue = principalInvested + interestEarned;
        
        chartData.push({
            name: `Month ${i}`,
            invested: principalInvested,
            value: Math.round(currentValue),
        });
    }
    return chartData;
}

/**
 * Generates data for a Fixed Deposit chart using FLAT monthly interest (e.g., 5 %/month).
 *
 * @param {number} principal - The FD principal amount.
 * @param {number} monthlyRatePercent - Monthly rate in percent (e.g., 5 = 5 %/month).
 * @param {number} termInMonths - Number of months to project.
 * @returns {Array} [{ name: 'Month 0', invested, value }, ...]
 */
export function generateFdGrowthChartData(principal, monthlyRatePercent, termInMonths) {
    if (!principal || !monthlyRatePercent || !termInMonths) return [];

    const rate = monthlyRatePercent / 100; // convert 5 → 0.05
    const chartData = [{ name: 'Start', invested: principal, value: principal }];

    for (let i = 1; i <= termInMonths; i++) {
        const projectedValue = principal + principal * rate * i; // ✅ flat monthly 5 %
        chartData.push({
            name: `Month ${i}`,
            invested: principal,
            value: Math.round(projectedValue),
        });
    }

    return chartData;
}


export function getLastPayoutDate(payoutHistory = []) {
    if (payoutHistory.length === 0) {
        return null;
    }
    // Sort by date descending and take the first one
    const latestPayout = [...payoutHistory].sort((a, b) => new Date(b.payoutDate) - new Date(a.payoutDate))[0];
    return new Date(latestPayout.payoutDate);
}

export function generateRdHistoricalChartData(investment) {
    const { principalAmount, interestRate, rdPeriodMonths, activationDate, installments = [] } = investment;
    if (!activationDate) return [];

    const chartData = [{ name: 'Start', invested: 0, value: 0 }];
    const startDate = new Date(activationDate);
    const paidInstallments = installments.filter(i => i.status === 'paid');

    // Create a point for each PAID installment
    for (let i = 0; i < paidInstallments.length; i++) {
        const principalInvested = (i + 1) * principalAmount;
        // Simple interest on the total invested so far for the period
        const termInYears = (i + 1) / 12;
        const interestEarned = principalInvested * interestRate * termInYears;
        const currentValue = principalInvested + interestEarned;

        const monthDate = new Date(startDate);
        monthDate.setMonth(monthDate.getMonth() + i);

        chartData.push({
            name: monthDate.toLocaleString('default', { month: 'short' }),
            invested: principalInvested,
            value: Math.round(currentValue),
        });
    }
    return chartData;
}

export function generateFdHistoricalChartData(investment) {
    const { principalAmount, interestRate, lockInPeriodMonths, activationDate } = investment;
    if (!activationDate) return [];

    const chartData = [{ name: 'Start', invested: principalAmount, value: principalAmount }];
    const startDate = new Date(activationDate);
    const today = new Date();
    const monthsPassed =
        (today.getFullYear() - startDate.getFullYear()) * 12 +
        (today.getMonth() - startDate.getMonth());
    
    // Always show at least some projection (minimum 3 months for sparkline)
    const relevantTerm = Math.max(3, Math.min(monthsPassed, lockInPeriodMonths || 12));
    const monthlyRate = interestRate; // already 5% per month (0.05 as decimal)

    for (let i = 1; i <= relevantTerm; i++) {
        const monthDate = new Date(startDate);
        monthDate.setMonth(monthDate.getMonth() + i);
        
        // Use actual accrued value for past months, projected for future
        const isPast = i <= monthsPassed;
        const value = principalAmount + principalAmount * monthlyRate * i;
        
        chartData.push({
            name: monthDate.toLocaleString('default', { month: 'short' }),
            invested: principalAmount,
            value: Math.round(value),
            isPast // optional: for styling past vs projected
        });
    }
    return chartData;
}

/**
 * Generates sparkline data specifically for FD Plus with 20-month cap
 */
function generateFdPlusSparklineData(investment, effectiveMonths) {
    const { principalAmount, interestRate, activationDate } = investment;
    if (!activationDate) return [];

    const chartData = [{ name: 'Start', invested: principalAmount, value: principalAmount }];
    const startDate = new Date(activationDate);
    
    // Show at least 3 months for sparkline, max 20 months (FD+ cap)
    const displayMonths = Math.max(3, Math.min(effectiveMonths || 0, 20));
    const monthlyInterest = principalAmount * interestRate;

    for (let i = 1; i <= displayMonths; i++) {
        const monthDate = new Date(startDate);
        monthDate.setMonth(monthDate.getMonth() + i);
        
        const gain = monthlyInterest * i;
        // Cap at principal (20 months = 200% return = principal doubles)
        const cappedGain = Math.min(gain, principalAmount);
        const value = principalAmount + cappedGain;
        
        chartData.push({
            name: monthDate.toLocaleString('default', { month: 'short' }),
            invested: principalAmount,
            value: Math.round(value),
        });
    }
    return chartData;
}


/**
 * Calculates the ACCRUED SIMPLE INTEREST for a given principal over a period.
 * This is the core engine for our live tickers.
 * @param {number} principal - The amount on which interest is calculated.
 * @param {number} annualRate - The annual interest rate as a decimal (e.g., 0.08).
 * @param {Date} startDate - The date from which to start calculating interest.
 * @returns {number} The total interest accrued up to the current second.
 */
function calculateAccruedInterest(principal, annualRate, startDate) {
    if (!principal || !annualRate || !startDate || principal <= 0) return 0;

    const now = new Date();
    const start = new Date(startDate);
    if (now < start) return 0; // Don't calculate interest for the future

    const secondsPassed = (now - start) / 1000;
    const interestPerSecond = (principal * parseFloat(annualRate)) / (365 * 24 * 60 * 60);
    
    return secondsPassed * interestPerSecond;
}

/**
 * The main function to calculate the complete, real-time analytics for a SINGLE investment.
 * This is the engine that powers the dashboard.
 * @param {object} investment - A single raw investment object from the API.
 * @returns {object} A full analytics object for that investment.
 */
export function calculateInvestmentAnalytics(investment) {
    // Only calculate for active investments
    if (!investment || investment.status !== 'active') {
        return {
            principalInvested: 0,
            currentValue: 0,
            totalGain: 0,
            gainPercentage: 0,
            gainPerSecond: 0,
            sparklineData: []
        };
    }

    const {
        type,
        principalAmount,
        interestRate,
        activationDate,
        payoutHistory = [],
        installments = []
    } = investment;

    let principalInvested = 0;
    let settledGain = 0;
    let accrualStartDate = new Date(activationDate);
    let principalForInterest = 0;
    let annualRateForAccrual = 0;

    // ---------------------------------------------------
    // ✅ FD
    // ---------------------------------------------------
    if (type === 'fd') {
        principalInvested = principalAmount;
        principalForInterest = principalAmount;
        
        // convert monthly rate -> annual rate
        // example: 5% monthly = 60% annual
        annualRateForAccrual = interestRate * 12;
        
        // Calculate live accrued interest
        const accruedGain = calculateAccruedInterest(
            principalForInterest,
            annualRateForAccrual,
            accrualStartDate
        );

        const currentValue = principalInvested + accruedGain;
        const gainPercentage = (accruedGain / principalInvested) * 100;
        const gainPerSecond = (principalAmount * annualRateForAccrual) / (365 * 24 * 60 * 60);

        return {
            principalInvested,
            currentValue,
            totalGain: accruedGain,
            gainPercentage,
            gainPerSecond,
            sparklineData: generateFdHistoricalChartData(investment),
        };
    }

    // ---------------------------------------------------
    // ⭐ FD PLUS (monthly interest with hard cap at 20 months)
    // ---------------------------------------------------
    else if (type === 'fd_plus') {
        principalInvested = principalAmount;

        const start = new Date(activationDate);
        const now = new Date();

        // Calculate FULL months only
        const monthsPassed =
            (now.getFullYear() - start.getFullYear()) * 12 +
            (now.getMonth() - start.getMonth());

        const effectiveMonths = Math.max(0, monthsPassed);
        const monthlyInterest = principalAmount * interestRate; // 10% of X per month

        const gain = monthlyInterest * effectiveMonths;

        // Hard cap: 20 months = maximum payout (principal doubles)
        const cappedGain = Math.min(gain, principalAmount); 
        const currentValue = principalInvested + cappedGain;

        // Generate sparkline data for FD+
        const sparklineData = generateFdPlusSparklineData(investment, effectiveMonths);

        return {
            principalInvested,
            currentValue,
            totalGain: cappedGain,
            gainPercentage: (cappedGain / principalInvested) * 100,
            gainPerSecond: 0, // ❌ NO LIVE INTEREST (monthly only)
            sparklineData
        };
    }

    // ---------------------------------------------------
    // ✅ RD
    // ---------------------------------------------------
    else if (type === 'rd') {
        principalInvested = installments.reduce(
            (sum, i) => sum + (i.status === 'paid' ? i.amountExpected : 0),
            0
        );
        settledGain = 0;
        principalForInterest = principalInvested;
        annualRateForAccrual = interestRate;
        
        // Calculate live accrued interest
        const accruedGain = calculateAccruedInterest(
            principalForInterest,
            annualRateForAccrual,
            accrualStartDate
        );

        const totalGain = settledGain + accruedGain;
        const currentValue = principalInvested + totalGain;
        const gainPercentage = principalInvested > 0 ? (totalGain / principalInvested) * 100 : 0;
        const annualInterest = principalForInterest * annualRateForAccrual;
        const gainPerSecond = annualInterest / (365 * 24 * 60 * 60);

        return {
            principalInvested,
            currentValue,
            totalGain,
            gainPercentage,
            gainPerSecond,
            sparklineData: generateRdHistoricalChartData(investment)
        };
    }

    // Fallback for unknown types
    return {
        principalInvested: 0,
        currentValue: 0,
        totalGain: 0,
        gainPercentage: 0,
        gainPerSecond: 0,
        sparklineData: []
    };
}

/**
 * Generates a simplified historical data series for a sparkline chart.
 */
function generateSparklineData(investment) {
    if (!investment || investment.status !== 'active') return [];

    const { type, principalAmount, interestRate, installments = [], payoutHistory = [] } = investment;
    let data = [];

    if (type === 'fd') {
        const monthlyInterest = principalAmount * parseFloat(interestRate) / 12;
        data.push(principalAmount); // Start
        for (let i = 1; i <= payoutHistory.length; i++) {
            data.push(principalAmount + (monthlyInterest * i));
        }
    } else if (type === 'rd') {
        const paidInstallments = installments.filter(i => i.status === 'paid');
        data.push(0); // Start
        let cumulativePrincipal = 0;
        for (let i = 0; i < paidInstallments.length; i++) {
            cumulativePrincipal += principalAmount;
            data.push(cumulativePrincipal); // Simple principal growth for sparkline
        }
    }
    return data.map(val => Math.round(val));
}