'use client';
import { Cart } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { Loader, Minus, Plus } from 'lucide-react';
import { removeItemFromCart, addItemToCart } from '@/lib/actions/cart.actions';
import { useToast } from '@/hooks/use-toast';

const CartTable = ({ cart }: { cart?: Cart }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <>
      <h1 className="py-4 h2-bold">Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          width={50}
                          height={50}
                          alt={item.name}
                        />
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="flex-center gap-2">
                      <div>
                        <Button
                          disabled={isPending}
                          type="button"
                          variant="outline"
                          onClick={() =>
                            startTransition(async () => {
                              const res = await removeItemFromCart(
                                item.productId
                              );

                              if (!res.success) {
                                toast({
                                  variant: 'destructive',
                                  description: res.message,
                                });
                              }
                            })
                          }
                        >
                          {isPending ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </Button>

                        <span className="px-2">{item.qty}</span>

                        <Button
                          disabled={isPending}
                          type="button"
                          variant="outline"
                          onClick={() =>
                            startTransition(async () => {
                              const res = await addItemToCart(item);

                              if (!res.success) {
                                toast({
                                  variant: 'destructive',
                                  description: res.message,
                                });
                              }
                            })
                          }
                        >
                          {isPending ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
};

export default CartTable;
