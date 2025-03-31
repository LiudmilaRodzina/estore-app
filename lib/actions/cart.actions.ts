'use server';
import { cookies } from 'next/headers';
import { CartItem } from '@/types';
import { convertToPlainObject, formatError } from '@/lib/utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema } from '../validators';

export async function addItemToCart(data: CartItem) {
  try {
    // Get cart cookie value
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Cart session not found');

    // Get session and user Id
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Get cart
    const cart = await getMyCart();

    // Parse and validate item
    const item = cartItemSchema.parse(data);

    // Find item in db
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    // TESTING
    console.log({
      sessionCartId: sessionCartId,
      userId: userId,
      itemRequested: item,
      productFromDB: product,
    });

    return {
      success: true,
      message: 'Item added to cart',
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  // Get cart cookie value
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if (!sessionCartId) throw new Error('Cart session not found');

  // Get session and user Id
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // Get user cart from db
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  // Cinvert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}
