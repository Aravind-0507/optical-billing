<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    protected $fillable = ['customer_id','invoice_id','re_sph','re_cyl','re_axis','re_add','le_sph','le_cyl','le_axis','le_add','visit_date','notes'];
    public function customer() { return $this->belongsTo(Customer::class); }
    public function invoice()  { return $this->belongsTo(Invoice::class); }
}
