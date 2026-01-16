const Table = require('../models/Table');
const { emitTableUpdate } = require('../socket/events');

/**
 * Get all tables
 * GET /api/tables
 */
const getAllTables = async (req, res, next) => {
  try {
    const tables = await Table.findAll();

    res.json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get table by ID (with current order if exists)
 * GET /api/tables/:id
 */
const getTableById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const table = await Table.findByIdWithOrder(id);

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Tavolo non trovato'
      });
    }

    res.json({
      success: true,
      data: table
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update table status
 * PUT /api/tables/:id
 */
const updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, covers, total } = req.body;

    // Verifica che il tavolo esista
    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Tavolo non trovato'
      });
    }

    // Aggiorna tavolo
    const updated = await Table.update(id, {
      status: status || table.status,
      covers: covers !== undefined ? covers : table.covers,
      total: total !== undefined ? total : table.total
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      emitTableUpdate(io, updated);
    }

    res.json({
      success: true,
      message: 'Tavolo aggiornato',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Free table (reset to free status)
 * PUT /api/tables/:id/free
 */
const freeTable = async (req, res, next) => {
  try {
    const { id } = req.params;

    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Tavolo non trovato'
      });
    }

    const freed = await Table.free(id);

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      emitTableUpdate(io, freed);
    }

    res.json({
      success: true,
      message: 'Tavolo liberato',
      data: freed
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTables,
  getTableById,
  updateTable,
  freeTable
};
