const { _calcularTotales } = require('../src/routes/ventas');

describe('calcularTotales', () => {
  test('calcula correctamente con un solo item sin descuento', () => {
    const items = [{ precio_unitario: 100, cantidad: 2 }];
    const res = _calcularTotales(items, 0);

    expect(res.subtotal).toBe(200);
    expect(res.descuento).toBe(0);
    expect(res.iva).toBe(24);
    expect(res.total).toBe(224);
  });

  test('aplica descuento correctamente', () => {
    const items = [{ precio_unitario: 100, cantidad: 1 }];
    const res = _calcularTotales(items, 10);

    expect(res.subtotal).toBe(100);
    expect(res.descuento).toBe(10);
    expect(res.iva).toBe(10.8);
    expect(res.total).toBe(100.8);
  });

  test('suma multiples items correctamente', () => {
    const items = [
      { precio_unitario: 50, cantidad: 2 },
      { precio_unitario: 25, cantidad: 4 }
    ];
    const res = _calcularTotales(items, 0);

    expect(res.subtotal).toBe(200);
    expect(res.total).toBe(224);
  });

  test('devuelve 0 para carrito vacio', () => {
    const res = _calcularTotales([], 0);

    expect(res.subtotal).toBe(0);
    expect(res.total).toBe(0);
  });

  test('redondea correctamente a 2 decimales', () => {
    const items = [{ precio_unitario: 10.99, cantidad: 3 }];
    const res = _calcularTotales(items, 0);

    expect(res.subtotal).toBe(32.97);
    const decimalesIva = res.iva.toString().split('.')[1]?.length || 0;
    expect(decimalesIva).toBeLessThanOrEqual(2);
  });
});
