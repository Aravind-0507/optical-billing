<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Models\InvoiceItem;
use App\Models\Customer;

class Invoice extends Model
{
    protected $fillable = ['customer_id','bill_no','subtotal','discount','discount_type','gst_rate','gst_amount','total','payment_mode','notes'];

    public function customer()     { return $this->belongsTo(Customer::class); }
    public function items()        { return $this->hasMany(InvoiceItem::class); }
    public function prescription() { return $this->hasOne(Prescription::class); }
}
