import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const payload = await req.json()
    
    // Validar payload
    if (!payload.orderId || !payload.customerPhone || !payload.items || payload.items.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payload inválido: campos obrigatórios ausentes' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Processar pedido WhatsApp
    const { data, error } = await supabaseClient
      .from('whatsapp_orders')
      .insert({
        id: payload.orderId,
        customer_phone: payload.customerPhone,
        customer_name: payload.customerName,
        customer_address: payload.customerAddress,
        items: payload.items,
        subtotal: payload.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        total: payload.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        payment_method: payload.paymentMethod,
        payment_status: 'pending',
        notes: payload.notes
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar pedido:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao salvar pedido no banco' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Pedido WhatsApp criado com sucesso:', data.id)

    return new Response(
      JSON.stringify({
        success: true,
        orderId: data.id,
        message: 'Pedido processado com sucesso'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro no webhook:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno do servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
