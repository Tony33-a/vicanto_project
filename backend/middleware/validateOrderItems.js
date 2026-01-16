/**
 * Middleware: Validazione Order Items
 * Valida structure e dati degli items dell'ordine
 * Previene dati malformati nel database
 */

const validateOrderItems = (req, res, next) => {
  const { items } = req.body;

  // Check items è array
  if (!Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      error: 'items deve essere un array'
    });
  }

  // Check items non vuoto
  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'items non può essere vuoto - almeno 1 item richiesto'
    });
  }

  // Valida ogni singolo item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Validazione category
    if (!item.category || typeof item.category !== 'string') {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: category mancante o non valida`
      });
    }

    if (item.category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: category non può essere vuota`
      });
    }

    // Validazione flavors
    if (!Array.isArray(item.flavors)) {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: flavors deve essere un array`
      });
    }

    if (item.flavors.length === 0) {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: flavors deve contenere almeno 1 gusto`
      });
    }

    // Check ogni flavor è stringa non vuota
    for (let j = 0; j < item.flavors.length; j++) {
      if (typeof item.flavors[j] !== 'string' || item.flavors[j].trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: `Item ${i}: flavor ${j} deve essere stringa non vuota`
        });
      }
    }

    // Validazione unit_price
    if (typeof item.unit_price !== 'number') {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: unit_price deve essere un numero`
      });
    }

    if (item.unit_price <= 0) {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: unit_price deve essere maggiore di 0`
      });
    }

    // Validazione quantity
    if (!Number.isInteger(item.quantity)) {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: quantity deve essere un numero intero`
      });
    }

    if (item.quantity < 1) {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: quantity deve essere almeno 1`
      });
    }

    if (item.quantity > 99) {
      return res.status(400).json({
        success: false,
        error: `Item ${i}: quantity non può superare 99`
      });
    }

    // Validazione course (opzionale, ma se presente deve essere valido)
    if (item.course !== undefined && item.course !== null) {
      if (!Number.isInteger(item.course)) {
        return res.status(400).json({
          success: false,
          error: `Item ${i}: course deve essere un numero intero`
        });
      }

      if (item.course < 1 || item.course > 5) {
        return res.status(400).json({
          success: false,
          error: `Item ${i}: course deve essere tra 1 e 5`
        });
      }
    }

    // Validazione custom_note (opzionale, ma se presente deve essere stringa)
    if (item.custom_note !== undefined && item.custom_note !== null) {
      if (typeof item.custom_note !== 'string') {
        return res.status(400).json({
          success: false,
          error: `Item ${i}: custom_note deve essere una stringa`
        });
      }

      if (item.custom_note.length > 500) {
        return res.status(400).json({
          success: false,
          error: `Item ${i}: custom_note non può superare 500 caratteri`
        });
      }
    }
  }

  // Validazione passata
  next();
};

module.exports = validateOrderItems;
