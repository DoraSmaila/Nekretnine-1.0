import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Analytics.css';
import { backendUrl } from '../config';

const Analytics = () => {
  const [chartData, setChartData] = useState([]);
  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        // Dohvati sve nekretnine vlasnika
        const propertiesRes = await axios.get(`${backendUrl}/api/properties/analytics/views/${user.email}`);
        // Dohvati sve preglede
        const viewersRes = await axios.get(`${backendUrl}/api/properties/analytics/viewers/${user.email}`);

        // Filtriraj da izbjegneš vlasnikove preglede
        const filteredViewers = viewersRes.data.filter(v => v.viewer_email !== user.email);

        // Kreiraj podatke za graf
        const data = propertiesRes.data.map(prop => {
          const viewsCount = filteredViewers.filter(v => v.property_id === prop.id).length;
          return {
            title: prop.title,
            views: viewsCount
          };
        });

        setChartData(data);
        setViewers(filteredViewers);
        setLoading(false);
      } catch (err) {
        console.error('Greška pri dohvaćanju statistike:', err);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (!user) return <p>Morate biti prijavljeni za pristup ovoj stranici.</p>;
  if (loading) return <p>Učitavanje podataka...</p>;
  if (chartData.length === 0) return <p>Nemate objava ili nema podataka o pregledima.</p>;

  return (
    <div className="analytics-container">
      <h2>Analitika pregleda vaših nekretnina</h2>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" interval={0} angle={-35} textAnchor="end" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="views" fill="#8884d8" name="Broj pregleda" />
        </BarChart>
      </ResponsiveContainer>

      <h3>Tko je gledao vaše nekretnine?</h3>
      {viewers.length === 0 ? (
        <p>Nema podataka o gledateljima.</p>
      ) : (
        <table className="viewers-table">
          <thead>
            <tr>
              <th>Nekretnina</th>
              <th>Korisnik (email)</th>
              <th>Datum i vrijeme pregleda</th>
            </tr>
          </thead>
          <tbody>
            {viewers.map((v, index) => (
              <tr key={index}>
                <td>{v.title}</td>
                <td>{v.viewer_email}</td>
                <td>{new Date(v.viewed_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Analytics;
