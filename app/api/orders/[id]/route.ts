import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json()

    // Client handles update via localOrderManager
    return NextResponse.json({
      order: { id: params.id, status },
      message: 'Order updated (handled client-side)',
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { message: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Client handles deletion via localOrderManager
    return NextResponse.json({
      success: true,
      message: 'Order deleted (handled client-side)',
    })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json(
      { message: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
