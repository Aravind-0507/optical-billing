<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name','category','brand','price','cost_price','stock','description'];

    public function invoiceItems() { return $this->hasMany(InvoiceItem::class); }
}
