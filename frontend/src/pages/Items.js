import React, { useEffect, useRef, useState } from 'react';
import { useData } from '../state/DataContext';
import { FixedSizeGrid as Grid } from 'react-window';

function SkeletonCard() {
  return (
    <div className="item-card skeleton">
      <div className="skeleton-img" />
      <div className="skeleton-text" style={{ width: '70%', height: 24, margin: '16px 0 8px 0' }} />
      <div className="skeleton-text" style={{ width: '40%', height: 18, marginBottom: 8 }} />
      <div className="skeleton-text" style={{ width: '30%', height: 20, marginBottom: 16 }} />
    </div>
  );
}

const CARD_WIDTH = 280; // slightly bigger card width
const CARD_HEIGHT = 320; // slightly bigger card height
const CARD_GAP = 32; // keep gap for spacing

function Items() {
  const { items, total, fetchItems } = useData();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const gridRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchItems({ page, limit, q: search })
      .then(() => { if (active) setLoading(false); })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fetchItems, page, limit, search]);

  // Responsive grid: update on resize
  useEffect(() => {
    function handleResize() {
      setContainerWidth(gridRef.current ? gridRef.current.offsetWidth : window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(total / limit);
  const data = loading ? Array.from({ length: limit }) : items;
  const itemCount = data.length;

  // Calculate columns based on container width
  const columns = Math.max(
    1,
    Math.floor((containerWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP))
  );
  const rows = Math.ceil(itemCount / columns);

  // Calculate grid height to fit only the visible rows (no extra space)
  const gridHeight = (CARD_HEIGHT + CARD_GAP) * rows + CARD_GAP;

  // Cell renderer
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const idx = rowIndex * columns + columnIndex;
    if (idx >= itemCount) return null;
    const item = data[idx];
    return (
      <div
        style={{
          ...style,
          left: style.left + CARD_GAP / 2,
          top: style.top + CARD_GAP / 2,
          width: CARD_WIDTH - CARD_GAP,
          height: CARD_HEIGHT - CARD_GAP,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          padding: CARD_GAP / 2,
        }}
      >
        {loading ? (
          <SkeletonCard />
        ) : (
          <div className="item-card" style={{
            boxShadow: '0 2px 12px 0 rgba(75,42,173,0.07)',
            borderRadius: 14,
            background: '#fff',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            minHeight: 220,
            width: '100%',
            height: '100%',
          }}>
            <div className="item-img" style={{
              background: '#e5e5e5',
              height: 120,
              borderRadius: 12,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              color: '#888'
            }}>
              300 x 200
            </div>
            <div className="item-info">
              <div className="item-name" style={{ fontWeight: 600, fontSize: '1.12em', marginBottom: 4 }}>{item?.name}</div>
              <div className="item-category" style={{ color: '#888', fontSize: '0.97em', marginBottom: 4 }}>{item?.category}</div>
              <div className="item-price" style={{ color: '#222', fontWeight: 600, fontSize: '1.05em', marginBottom: 14 }}>${item?.price}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Search and Pagination Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, margin: '32px 0 20px 0',
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            padding: '10px 16px', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: '1.08em',
            boxShadow: '0 1px 4px 0 rgba(75,42,173,0.04)', minWidth: 220, outline: 'none',
            transition: 'border 0.2s',
          }}
        />
        <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
          style={{
            padding: '10px 14px', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: '1.08em',
            background: '#fafaff', color: '#4B2AAD', fontWeight: 600, outline: 'none', minWidth: 120,
            boxShadow: '0 1px 4px 0 rgba(75,42,173,0.04)',
          }}>
          {[10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <span style={{ color: '#6b7280', fontSize: '1em', fontWeight: 500, marginLeft: 8 }}>Total: {total}</span>
      </div>
      {/* Virtualized Responsive Grid */}
      <div ref={gridRef} style={{ width: '100%', maxWidth: 1600, margin: '0 auto' }}>
        <Grid
          columnCount={columns}
          rowCount={rows}
          columnWidth={CARD_WIDTH + CARD_GAP}
          rowHeight={CARD_HEIGHT + CARD_GAP}
          height={gridHeight}
          width={containerWidth}
        >
          {Cell}
        </Grid>
      </div>
      {/* Pagination Controls */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, margin: '32px 0',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            padding: '10px 22px', borderRadius: 999, border: 'none',
            background: page === 1 ? '#e5e7eb' : 'linear-gradient(90deg, #6D5DFB 0%, #4B2AAD 100%)',
            color: page === 1 ? '#a1a1aa' : '#fff', fontWeight: 700, fontSize: '1.08em',
            boxShadow: page === 1 ? 'none' : '0 2px 8px 0 rgba(75,42,173,0.10)',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, color 0.2s',
            minWidth: 80,
          }}>
          &#8592; Prev
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
            Math.max(0, page - 3), Math.min(totalPages, page + 2)
          ).map(pn => (
            <button
              key={pn}
              onClick={() => setPage(pn)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: pn === page ? 'linear-gradient(90deg, #6D5DFB 0%, #4B2AAD 100%)' : '#f3f4f6',
                color: pn === page ? '#fff' : '#4B2AAD', fontWeight: pn === page ? 700 : 600,
                fontSize: '1.05em', margin: '0 2px', cursor: pn === page ? 'default' : 'pointer',
                boxShadow: pn === page ? '0 2px 8px 0 rgba(75,42,173,0.10)' : 'none',
                outline: pn === page ? '2px solid #4B2AAD' : 'none',
                borderBottom: pn === page ? '2.5px solid #4B2AAD' : 'none',
                transition: 'background 0.2s, color 0.2s',
                minWidth: 40,
              }}
              disabled={pn === page}
            >
              {pn}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
          style={{
            padding: '10px 22px', borderRadius: 999, border: 'none',
            background: (page === totalPages || totalPages === 0) ? '#e5e7eb' : 'linear-gradient(90deg, #6D5DFB 0%, #4B2AAD 100%)',
            color: (page === totalPages || totalPages === 0) ? '#a1a1aa' : '#fff', fontWeight: 700, fontSize: '1.08em',
            boxShadow: (page === totalPages || totalPages === 0) ? 'none' : '0 2px 8px 0 rgba(75,42,173,0.10)',
            cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, color 0.2s',
            minWidth: 80,
          }}>
          Next &#8594;
        </button>
      </div>
    </>
  );
}

export default Items;