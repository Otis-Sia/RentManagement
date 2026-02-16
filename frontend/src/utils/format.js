export const formatCurrency = (amount) => {
    return `KSh ${parseFloat(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // MMM/dd/yyyy format (e.g. Jan/01/2026)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};
