
def get_orders(cls, cols):
    order_cols = []
    for order_col in cols:
        desc = order_col.endswith('_desc')
        if desc:
            col_name = '_'.join(order_col.split('_')[:-1])
        else:
            col_name = order_col

        if not hasattr(cls, col_name):
            raise ValueError('Invalid column name in order: {0}, {1}'.format(cls.__name__, order_col))
        order_col = getattr(cls, col_name)

        if desc:
            order_cols.append(order_col.desc())

        order_cols.append(order_col)

    return order_cols
