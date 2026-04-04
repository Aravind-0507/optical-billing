{{-- resources/views/reports/daily.blade.php --}}
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; color: #333; margin: 0; padding: 20px; }
  h1   { font-size: 18px; margin: 0 0 4px; }
  .header { text-align: center; border-bottom: 2px solid #0f2340; padding-bottom: 12px; margin-bottom: 16px; }
  .summary { display: flex; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; }
  .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 16px; }
  .stat .val { font-size: 18px; font-weight: bold; color: #0f2340; }
  .stat .lbl { font-size: 10px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #0f2340; color: white; text-align: left; padding: 7px 10px; font-size: 10px; }
  td { padding: 6px 10px; border-bottom: 1px solid #f1f5f9; }
  tr:nth-child(even) td { background: #f8fafc; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: bold; }
  .cash { background: #dcfce7; color: #15803d; }
  .upi  { background: #dbeafe; color: #1d4ed8; }
  .card { background: #ede9fe; color: #6d28d9; }
  .total-row td { font-weight: bold; background: #eff6ff; font-size: 12px; }
</style>
</head>
<body>
<div class="header">
  <h1>{{ $settings['shop_name'] ?? 'Vision Optical' }}</h1>
  <p>{{ $settings['address'] ?? '' }}, {{ $settings['city'] ?? '' }} | Ph: {{ $settings['phone'] ?? '' }}</p>
  @if(!empty($settings['gst_no']))<p>GSTIN: {{ $settings['gst_no'] }}</p>@endif
  <p style="margin-top:8px;font-size:13px;font-weight:bold;color:#0f2340">
    Sales Report: {{ \Carbon\Carbon::parse($from)->format('d M Y') }} to {{ \Carbon\Carbon::parse($to)->format('d M Y') }}
  </p>
</div>

<div class="summary">
  <div class="stat"><div class="val">{{ $summary['total_bills'] }}</div><div class="lbl">Total Bills</div></div>
  <div class="stat"><div class="val">₹{{ number_format($summary['total_revenue'], 2) }}</div><div class="lbl">Total Revenue</div></div>
  <div class="stat"><div class="val">₹{{ number_format($summary['cash'], 2) }}</div><div class="lbl">Cash</div></div>
  <div class="stat"><div class="val">₹{{ number_format($summary['upi'], 2) }}</div><div class="lbl">UPI</div></div>
  <div class="stat"><div class="val">₹{{ number_format($summary['card'], 2) }}</div><div class="lbl">Card</div></div>
</div>

<table>
  <thead>
    <tr>
      <th>#</th><th>Bill No</th><th>Customer</th><th>Date</th><th>Subtotal</th><th>Discount</th><th>GST</th><th>Total</th><th>Mode</th>
    </tr>
  </thead>
  <tbody>
    @foreach($invoices as $i => $inv)
    <tr>
      <td>{{ $i+1 }}</td>
      <td>{{ $inv->bill_no }}</td>
      <td>{{ $inv->customer?->name }}</td>
      <td>{{ \Carbon\Carbon::parse($inv->created_at)->format('d/m/Y') }}</td>
      <td>₹{{ number_format($inv->subtotal, 2) }}</td>
      <td>₹{{ number_format($inv->discount, 2) }}</td>
      <td>₹{{ number_format($inv->gst_amount, 2) }}</td>
      <td><strong>₹{{ number_format($inv->total, 2) }}</strong></td>
      <td><span class="badge {{ $inv->payment_mode }}">{{ strtoupper($inv->payment_mode) }}</span></td>
    </tr>
    @endforeach
    <tr class="total-row">
      <td colspan="7" style="text-align:right">GRAND TOTAL</td>
      <td>₹{{ number_format($summary['total_revenue'], 2) }}</td>
      <td></td>
    </tr>
  </tbody>
</table>

<p style="margin-top:20px;font-size:10px;color:#94a3b8;text-align:center">
  Generated on {{ now()->format('d M Y, h:i A') }} • {{ $settings['shop_name'] ?? 'Vision Optical' }}
</p>
</body>
</html>
