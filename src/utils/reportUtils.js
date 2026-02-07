import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const generatePDFReport = (data, filters, profile) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Neubrutalist Header
    doc.setFillColor(19, 127, 236); // Primary blue
    doc.rect(10, 10, pageWidth - 20, 30, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(10, 10, pageWidth - 20, 30, 'S');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('SMART TRUCK MANAGER', pageWidth / 2, 25, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`REPORT: ${filters.dateRange.toUpperCase()}`, pageWidth / 2, 35, { align: 'center' });

    // Business Info Card
    let y = 50;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.rect(10, y, pageWidth - 20, 25, 'FD');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(profile?.full_name || 'Business Report', 15, y + 10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, y + 20);
    doc.text(`Truck Filter: ${filters.truck === 'all' ? 'All Trucks' : filters.truck}`, pageWidth - 15, y + 15, { align: 'right' });

    y += 35;

    // Helper for Tables
    const addTable = (title, headers, body) => {
        if (!body || body.length === 0) return;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(title.toUpperCase(), 10, y);
        y += 5;

        autoTable(doc, {
            startY: y,
            head: [headers],
            body: body,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                lineWidth: 0.5,
                lineColor: [0, 0, 0]
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                fontSize: 9,
                lineWidth: 0.5,
                lineColor: [0, 0, 0]
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            },
            margin: { left: 10, right: 10 }
        });
        y = doc.lastAutoTable.finalY + 15;

        // Check for page overflow
        if (y > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            y = 20;
        }
    };

    // 1. Trips Table
    const tripHeaders = ['Date', 'Truck', 'Material', 'From/To', 'Amount', 'Paid', 'Balance'];
    const tripBody = (data.trips || []).map(t => [
        new Date(t.trip_date).toLocaleDateString(),
        t.truck_number || 'N/A',
        t.material || 'N/A',
        `${t.source || t.location || ''} -> ${t.destination || ''}`,
        `Rs.${t.amount || 0}`,
        `Rs.${t.paid_amount || 0}`,
        `Rs.${(t.amount || 0) - (t.paid_amount || 0)}`
    ]);
    addTable('Trips Report', tripHeaders, tripBody);

    // 2. Fuel Expenses Table
    const fuelHeaders = ['Date', 'Truck', 'Pump', 'Liters', 'Rate', 'Amount'];
    const fuelBody = (data.fuelExpenses || []).map(f => [
        new Date(f.expense_date).toLocaleDateString(),
        f.truck_number || 'N/A',
        f.pump_name || 'Local',
        f.liters || 0,
        `Rs.${f.rate || 0}`,
        `Rs.${f.amount || 0}`
    ]);
    addTable('Fuel Expenses', fuelHeaders, fuelBody);

    // 3. Other Expenses Table
    const expenseHeaders = ['Date', 'Truck', 'Category', 'Description', 'Amount'];
    const expenseBody = (data.expenses || []).map(e => [
        new Date(e.expense_date).toLocaleDateString(),
        e.truck_number || 'N/A',
        e.category || 'Other',
        e.description || 'N/A',
        `Rs.${e.amount || 0}`
    ]);
    addTable('General Expenses', expenseHeaders, expenseBody);

    // 4. Payments Table
    const paymentHeaders = ['Date', 'Truck/Driver', 'Type', 'Amount', 'Remark'];
    const paymentBody = (data.payments || []).map(p => [
        new Date(p.payment_date || p.created_at).toLocaleDateString(),
        p.truck_number || p.driver_name || 'N/A',
        p.payment_type || 'Generic',
        `Rs.${p.amount || 0}`,
        p.remark || 'N/A'
    ]);
    addTable('Payments History', paymentHeaders, paymentBody);

    // 5. Drivers Table
    const driverHeaders = ['Name', 'Mobile', 'License', 'Blood Group', 'Salary'];
    const driverBody = (data.drivers || []).map(d => [
        d.name || 'N/A',
        d.mobile_primary || 'N/A',
        d.license_number || 'N/A',
        d.blood_group || 'N/A',
        `Rs.${d.salary || 0}/mo`
    ]);
    addTable('Driver Directory', driverHeaders, driverBody);

    // 6. Suppliers Table
    const supplierHeaders = ['Name', 'Mobile', 'Address', 'Status'];
    const supplierBody = (data.suppliers || []).map(s => [
        s.name || 'N/A',
        s.mobile || 'N/A',
        s.address || 'N/A',
        'Active'
    ]);
    addTable('Suppliers List', supplierHeaders, supplierBody);

    doc.save(`TruckManager_Report_${filters.dateRange}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateExcelReport = (data, filters) => {
    const wb = XLSX.utils.book_new();

    // Trips Sheet
    const tripData = data.trips.map(t => ({
        Date: new Date(t.trip_date).toLocaleDateString(),
        Truck: t.truck_number,
        Material: t.material,
        From: t.source || t.location,
        To: t.destination,
        Amount: t.amount,
        Paid: t.paid_amount,
        Balance: (t.amount || 0) - (t.paid_amount || 0)
    }));
    const tripSheet = XLSX.utils.json_to_sheet(tripData);
    XLSX.utils.book_append_sheet(wb, tripSheet, "Trips");

    // Fuel Sheet
    const fuelData = data.fuelExpenses.map(f => ({
        Date: new Date(f.expense_date).toLocaleDateString(),
        Truck: f.truck_number,
        Pump: f.pump_name,
        Liters: f.liters,
        Rate: f.rate,
        Amount: f.amount
    }));
    const fuelSheet = XLSX.utils.json_to_sheet(fuelData);
    XLSX.utils.book_append_sheet(wb, fuelSheet, "Fuel Expenses");

    // Expenses Sheet
    const expenseData = data.expenses.map(e => ({
        Date: new Date(e.expense_date).toLocaleDateString(),
        Truck: e.truck_number,
        Category: e.category,
        Description: e.description,
        Amount: e.amount
    }));
    const expenseSheet = XLSX.utils.json_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(wb, expenseSheet, "General Expenses");

    // Payments Sheet
    const paymentData = data.payments.map(p => ({
        Date: new Date(p.payment_date || p.created_at).toLocaleDateString(),
        Target: p.truck_number || p.driver_name,
        Type: p.payment_type,
        Amount: p.amount,
        Remark: p.remark
    }));
    const paymentSheet = XLSX.utils.json_to_sheet(paymentData);
    XLSX.utils.book_append_sheet(wb, paymentSheet, "Payments");

    // Drivers Sheet
    const driverData = data.drivers.map(d => ({
        Name: d.name,
        Mobile: d.mobile_primary,
        License: d.license_number,
        Blood: d.blood_group,
        Salary: d.salary
    }));
    const driverSheet = XLSX.utils.json_to_sheet(driverData);
    XLSX.utils.book_append_sheet(wb, driverSheet, "Drivers");

    // Suppliers Sheet
    const supplierData = data.suppliers.map(s => ({
        Name: s.name,
        Mobile: s.mobile,
        Address: s.address
    }));
    const supplierSheet = XLSX.utils.json_to_sheet(supplierData);
    XLSX.utils.book_append_sheet(wb, supplierSheet, "Suppliers");

    XLSX.writeFile(wb, `TruckManager_Report_${filters.dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
